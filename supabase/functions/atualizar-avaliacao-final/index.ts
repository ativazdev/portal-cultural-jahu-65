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

    // Verificar se é parecerista
    if (payload.user_type !== 'parecerista') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas pareceristas podem atualizar avaliações.' }),
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

    const { projeto_id } = await req.json()

    if (!projeto_id) {
      return new Response(
        JSON.stringify({ error: 'ID do projeto não fornecido' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Buscar todas as avaliações do projeto
    const { data: avaliacoes, error: avaliacoesError } = await supabase
      .from('avaliacoes')
      .select('id, status, nota_final')
      .eq('projeto_id', projeto_id)

    if (avaliacoesError) {
      console.error('Erro ao buscar avaliações:', avaliacoesError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar avaliações', details: avaliacoesError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    if (!avaliacoes || avaliacoes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma avaliação encontrada para este projeto' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const totalAvaliacoes = avaliacoes.length
    const avaliacoesConcluidas = avaliacoes.filter(a => a.status === 'avaliado')
    const totalConcluidas = avaliacoesConcluidas.length

    // Verificar se todas as avaliações foram concluídas
    if (totalConcluidas === totalAvaliacoes && totalAvaliacoes > 0) {
      // Calcular média das notas finais
      const notasFinais = avaliacoesConcluidas
        .map(a => a.nota_final)
        .filter(nota => nota !== null && nota !== undefined) as number[]

      if (notasFinais.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Nenhuma nota final encontrada nas avaliações concluídas' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const somaNotas = notasFinais.reduce((acc, nota) => acc + nota, 0)
      const notaMedia = somaNotas / notasFinais.length

      // Atualizar nota_media e status do projeto
      const { data: projetoAtualizado, error: updateError } = await supabase
        .from('projetos')
        .update({
          nota_media: Math.round(notaMedia * 100) / 100, // Arredondar para 2 casas decimais
          status: 'avaliado',
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

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Avaliação final atualizada com sucesso',
          projeto: projetoAtualizado,
          nota_media: notaMedia,
          total_avaliacoes: totalAvaliacoes,
          avaliacoes_concluidas: totalConcluidas
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Ainda há avaliações pendentes
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Avaliação salva. Aguardando conclusão de todas as avaliações.',
          total_avaliacoes: totalAvaliacoes,
          avaliacoes_concluidas: totalConcluidas,
          avaliacoes_pendentes: totalAvaliacoes - totalConcluidas
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
  } catch (error: any) {
    console.error('Erro na função atualizar-avaliacao-final:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

