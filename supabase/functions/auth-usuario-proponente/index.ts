import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, senha } = await req.json()

    // Validações básicas
    if (!email || !senha) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar credenciais usando a função SQL
    const { data: usuarioData, error: authError } = await supabase
      .rpc('verificar_senha_usuario', {
        p_email: email,
        p_senha: senha
      })

    if (authError || !usuarioData || usuarioData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Email ou senha inválidos' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const usuario = usuarioData[0]

    // Atualizar último acesso
    await supabase
      .from('usuarios_proponentes')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', usuario.id)

    // Buscar dados da prefeitura
    const { data: prefeitura } = await supabase
      .from('prefeituras')
      .select('nome, municipio, estado')
      .eq('id', usuario.prefeitura_id)
      .single()

    // Buscar proponentes do usuário
    const { data: proponentes } = await supabase
      .rpc('buscar_proponentes_usuario', {
        p_usuario_id: usuario.id
      })

    // Gerar JWT customizado
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'your-secret-key'
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const jwt = await create(
      { alg: "HS256", typ: "JWT" },
      {
        sub: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        prefeitura_id: usuario.prefeitura_id,
        user_type: 'proponente',
        iat: getNumericDate(0),
        exp: getNumericDate(60 * 60 * 24 * 7), // 7 dias
      },
      key
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login realizado com sucesso',
        token: jwt,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          prefeitura_id: usuario.prefeitura_id,
          prefeitura: prefeitura,
          proponentes: proponentes || []
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro no login:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

