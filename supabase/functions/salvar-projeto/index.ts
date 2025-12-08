import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts"

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

// Função para verificar token JWT
async function verifyToken(token: string): Promise<any> {
  const jwtSecret = Deno.env.get('JWT_SECRET')
  if (!jwtSecret) {
    throw new Error('JWT Secret não configurado')
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  )

  try {
    const payload = await verify(token, key)
    return payload
  } catch (error) {
    throw new Error('Token inválido')
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
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token)

    // Verificar se é proponente
    if (payload.user_type !== 'proponente') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas proponentes podem criar/editar projetos.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    // Criar cliente Supabase com SERVICE_ROLE_KEY (bypassa RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { projeto_id, ...projetoData } = await req.json()

    // Validar dados obrigatórios
    if (!projetoData.nome || !projetoData.modalidade || !projetoData.descricao || !projetoData.objetivos) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios não preenchidos' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (!projetoData.proponente_id) {
      return new Response(
        JSON.stringify({ error: 'Proponente não especificado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Verificar se o proponente pertence ao usuário
    const { data: proponente, error: proponenteError } = await supabase
      .from('proponentes')
      .select('id, usuario_id, prefeitura_id')
      .eq('id', projetoData.proponente_id)
      .single()

    if (proponenteError || !proponente) {
      return new Response(
        JSON.stringify({ error: 'Proponente não encontrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Verificar se o proponente pertence ao usuário logado
    if (proponente.usuario_id !== payload.sub) {
      return new Response(
        JSON.stringify({ error: 'Proponente não pertence ao usuário logado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      )
    }

    // Garantir que prefeitura_id está correto
    projetoData.prefeitura_id = proponente.prefeitura_id

    let resultado

    if (projeto_id) {
      // Atualizar projeto existente
      // Verificar se o projeto pertence ao usuário
      const { data: projetoExistente, error: projetoError } = await supabase
        .from('projetos')
        .select('id, proponente_id, status')
        .eq('id', projeto_id)
        .single()

      if (projetoError || !projetoExistente) {
        return new Response(
          JSON.stringify({ error: 'Projeto não encontrado' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        )
      }

      // Verificar se o projeto pertence a um proponente do usuário
      const { data: proponenteProjeto } = await supabase
        .from('proponentes')
        .select('usuario_id')
        .eq('id', projetoExistente.proponente_id)
        .single()

      if (!proponenteProjeto || proponenteProjeto.usuario_id !== payload.sub) {
        return new Response(
          JSON.stringify({ error: 'Projeto não pertence ao usuário logado' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }

      // Verificar se o projeto está em rascunho (pode editar)
      if (projetoExistente.status !== 'rascunho') {
        return new Response(
          JSON.stringify({ error: 'Apenas projetos em rascunho podem ser editados' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }

      // Atualizar projeto
      const { data: projetoAtualizado, error: updateError } = await supabase
        .from('projetos')
        .update({
          ...projetoData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projeto_id)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar projeto:', updateError)
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar projeto', details: updateError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      resultado = projetoAtualizado
    } else {
      // Criar novo projeto
      // Gerar número de inscrição se necessário
      if (!projetoData.numero_inscricao && projetoData.edital_id) {
        const { data: edital } = await supabase
          .from('editais')
          .select('codigo')
          .eq('id', projetoData.edital_id)
          .single()

        if (edital) {
          const { count } = await supabase
            .from('projetos')
            .select('*', { count: 'exact', head: true })
            .eq('edital_id', projetoData.edital_id)
            .not('numero_inscricao', 'is', null)

          const proximoNumero = (count || 0) + 1
          const numeroFormatado = String(proximoNumero).padStart(3, '0')
          projetoData.numero_inscricao = `${edital.codigo}-${numeroFormatado}`
        }
      }

      // Garantir status inicial
      if (!projetoData.status) {
        projetoData.status = 'rascunho'
      }

      // Inserir projeto
      const { data: projetoCriado, error: insertError } = await supabase
        .from('projetos')
        .insert([projetoData])
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao criar projeto:', insertError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar projeto', details: insertError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      resultado = projetoCriado
    }

    return new Response(
      JSON.stringify({
        success: true,
        projeto: resultado
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: projeto_id ? 200 : 201 
      }
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

