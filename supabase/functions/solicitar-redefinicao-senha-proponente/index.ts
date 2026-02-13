import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// URLs permitidas para CORS
const ALLOWED_ORIGINS = [
  'https://portalativaz.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://69.6.250.98:8080',
  'http://pnabjau.com.br',
  'https://www.pnabjau.com.br',
  'https://pnabjau.com.br',
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
    const { email } = await req.json()

    // Validações básicas
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
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

    // Verificar se o usuário existe
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios_proponentes')
      .select('id, email, nome, prefeitura_id')
      .eq('email', email.toLowerCase())
      .eq('ativo', true)
      .single()

    if (usuarioError || !usuario) {
      // Por segurança, não revelar se o email existe ou não
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se o email existir, você receberá um link para redefinir sua senha' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Buscar dados da prefeitura
    const { data: prefeitura } = await supabase
      .from('prefeituras')
      .select('nome, municipio')
      .eq('id', usuario.prefeitura_id)
      .single()

    // Gerar token usando função RPC
    const { data: token, error: tokenError } = await supabase
      .rpc('gerar_token_recuperacao_usuario', {
        p_email: email.toLowerCase()
      })

    if (tokenError) {
      console.error('Erro ao gerar token:', tokenError)
      // Por segurança, retornar sucesso mesmo em caso de erro
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se o email existir, você receberá um link para redefinir sua senha' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Construir URL de redefinição
    // Buscar municipio da prefeitura para construir a URL correta
    const { data: prefeituraData } = await supabase
      .from('prefeituras')
      .select('municipio')
      .eq('id', usuario.prefeitura_id)
      .single()
    
    // Criar slug a partir do municipio (minúsculas, sem acentos, espaços viram hífens)
    const municipio = prefeituraData?.municipio || 'prefeitura'
    const nomePrefeitura = municipio.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    
    const baseUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
    const resetUrl = `${baseUrl}/${nomePrefeitura}/proponente/redefinicao-senha?token=${token}&email=${encodeURIComponent(email)}`

    // Enviar email usando Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY não configurada')
      throw new Error('Configuração de email não encontrada')
    }

    const prefeituraNome = prefeitura?.nome || 'Prefeitura'
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - Portal Cultural</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #059669;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Portal Cultural</div>
            <div style="color: #64748b; font-size: 16px;">${prefeituraNome}</div>
          </div>
          
          <div class="content">
            <h2>Olá, ${usuario.nome}!</h2>
            
            <p>Você solicitou a redefinição de senha da sua conta no Portal Cultural.</p>
            
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </div>
            
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link expira em 1 hora</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Não compartilhe este link com ninguém</li>
              </ul>
            </div>
            
            <p>Se você tiver alguma dúvida, entre em contato com o suporte.</p>
          </div>
          
          <div class="footer">
            <p>Este é um e-mail automático. Não responda a esta mensagem.</p>
            <p>Portal Cultural - ${prefeituraNome}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portal Cultural <noreply@notifications.pnabjau.com.br>',
        to: [email],
        subject: `Redefinir Senha - Portal Cultural ${prefeituraNome}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Erro ao enviar email:', errorData)
      // Por segurança, retornar sucesso mesmo em caso de erro
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Se o email existir, você receberá um link para redefinir sua senha' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Se o email existir, você receberá um link para redefinir sua senha'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error)
    // Por segurança, retornar sucesso mesmo em caso de erro
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Se o email existir, você receberá um link para redefinir sua senha' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})

