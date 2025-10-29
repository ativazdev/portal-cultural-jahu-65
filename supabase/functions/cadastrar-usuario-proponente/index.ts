import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prefeitura_id, nome, email, senha } = await req.json()

    // Validações básicas
    if (!prefeitura_id || !nome || !email || !senha) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validar senha
    if (senha.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter no mínimo 6 caracteres' }),
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

    // Verificar se a prefeitura existe
    const { data: prefeitura, error: prefeituraError } = await supabase
      .from('prefeituras')
      .select('id')
      .eq('id', prefeitura_id)
      .single()

    if (prefeituraError || !prefeitura) {
      return new Response(
        JSON.stringify({ error: 'Prefeitura não encontrada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Verificar se o email já existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios_proponentes')
      .select('id')
      .eq('email', email)
      .single()

    if (usuarioExistente) {
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409 
        }
      )
    }

    // Inserir usuário (o trigger vai criptografar a senha)
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios_proponentes')
      .insert({
        prefeitura_id,
        nome,
        email,
        senha_hash: senha // Será criptografada pelo trigger
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao inserir usuário:', insertError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário', details: insertError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    )

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

