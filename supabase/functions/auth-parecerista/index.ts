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

    // Buscar parecerista por email
    const { data: parecerista, error: selectError } = await supabaseClient
      .from('pareceristas')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (selectError || !parecerista) {
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o parecerista está ativo
    if (parecerista.status !== 'ativo') {
      return new Response(
        JSON.stringify({ error: 'Usuário inativo ou bloqueado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar senha usando a função crypt do PostgreSQL
    const { data: senhaValida, error: cryptError } = await supabaseClient
      .rpc('verificar_senha_parecerista', {
        p_id: parecerista.id,
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
      .from('pareceristas')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', parecerista.id)

    // Buscar prefeitura
    const { data: prefeitura } = await supabaseClient
      .from('prefeituras')
      .select('*')
      .eq('id', parecerista.prefeitura_id)
      .single()

    // Criar token JWT customizado
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')
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
      sub: parecerista.id,
      email: parecerista.email,
      user_type: 'parecerista',
      prefeitura_id: parecerista.prefeitura_id,
      role: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 dias
    }

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key)

    // Remover senha do objeto retornado
    const { senha_hash, ...dadosParecerista } = parecerista

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        parecerista: dadosParecerista,
        prefeitura,
        user_type: 'parecerista'
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

