import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, senha } = await req.json()

    // Validações básicas
    if (!email || !senha) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar proponente por email
    const { data: proponente, error: selectError } = await supabaseClient
      .from('proponentes')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (selectError || !proponente) {
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o proponente está ativo
    if (proponente.status !== 'ativo') {
      return new Response(
        JSON.stringify({ error: 'Usuário inativo ou bloqueado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar senha usando a função crypt do PostgreSQL
    const { data: senhaValida, error: cryptError } = await supabaseClient
      .rpc('verificar_senha_proponente', {
        p_id: proponente.id,
        p_senha: senha
      })

    if (cryptError || !senhaValida) {
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar último acesso
    await supabaseClient
      .from('proponentes')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', proponente.id)

    // Buscar prefeitura
    const { data: prefeitura } = await supabaseClient
      .from('prefeituras')
      .select('*')
      .eq('id', proponente.prefeitura_id)
      .single()

    // Criar token JWT customizado
    const jwtSecret = Deno.env.get('JWT_SECRET')
    if (!jwtSecret) {
      throw new Error('JWT Secret não configurado')
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    )

    const payload = {
      sub: proponente.id,
      email: proponente.email,
      user_type: 'proponente',
      prefeitura_id: proponente.prefeitura_id,
      role: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 dias
    }

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key)

    // Remover senha do objeto retornado
    const { senha_hash, ...dadosProponente } = proponente

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        proponente: dadosProponente,
        prefeitura,
        user_type: 'proponente'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

