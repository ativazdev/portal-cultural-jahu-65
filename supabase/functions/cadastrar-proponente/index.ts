import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// URLs permitidas para CORS
const ALLOWED_ORIGINS = [
  'https://portalativaz.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
]

// Função para obter headers CORS baseado na origem
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const dados = await req.json()
    
    const { 
      prefeitura_id,
      email,
      senha,
      tipo,
      nome,
      cpf,
      cnpj
    } = dados

    // Validações básicas
    if (!prefeitura_id || !email || !senha || !tipo || !nome) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios faltando: prefeitura_id, email, senha, tipo, nome' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar tipo de proponente
    if (!['PF', 'PJ', 'Grupo', 'COOP'].includes(tipo)) {
      return new Response(
        JSON.stringify({ error: 'Tipo de proponente inválido. Deve ser PF, PJ, Grupo ou COOP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar CPF para PF
    if (tipo === 'PF' && !cpf) {
      return new Response(
        JSON.stringify({ error: 'CPF é obrigatório para Pessoa Física' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar CNPJ para PJ
    if (tipo === 'PJ' && !cnpj) {
      return new Response(
        JSON.stringify({ error: 'CNPJ é obrigatório para Pessoa Jurídica' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar senha (mínimo 6 caracteres)
    if (senha.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter no mínimo 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se email já existe
    const { data: emailExists } = await supabaseClient
      .from('proponentes')
      .select('id')
      .eq('email', email)
      .single()

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: 'Email já cadastrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se CPF já existe (se PF)
    if (tipo === 'PF') {
      const { data: cpfExists } = await supabaseClient
        .from('proponentes')
        .select('id')
        .eq('cpf', cpf)
        .single()

      if (cpfExists) {
        return new Response(
          JSON.stringify({ error: 'CPF já cadastrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Verificar se CNPJ já existe (se PJ)
    if (tipo === 'PJ') {
      const { data: cnpjExists } = await supabaseClient
        .from('proponentes')
        .select('id')
        .eq('cnpj', cnpj)
        .single()

      if (cnpjExists) {
        return new Response(
          JSON.stringify({ error: 'CNPJ já cadastrado' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Preparar dados para inserção
    const dadosProponente = {
      prefeitura_id,
      email: email.toLowerCase(),
      senha_hash: senha, // Será criptografado pelo trigger
      tipo,
      nome,
      status: 'ativo',
      ...dados // Incluir todos os outros campos opcionais
    }

    // Remover campos que não devem ser inseridos diretamente
    delete dadosProponente.senha

    // Inserir proponente
    const { data: proponente, error: insertError } = await supabaseClient
      .from('proponentes')
      .insert(dadosProponente)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao inserir proponente:', insertError)
      return new Response(
        JSON.stringify({ error: 'Erro ao cadastrar proponente: ' + insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Atualizar o hash da senha usando SQL direto
    await supabaseClient.rpc('atualizar_senha_proponente', {
      p_id: proponente.id,
      p_senha: senha
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Proponente cadastrado com sucesso',
        proponente: {
          id: proponente.id,
          nome: proponente.nome,
          email: proponente.email,
          tipo: proponente.tipo,
          cpf: proponente.cpf,
          cnpj: proponente.cnpj
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

