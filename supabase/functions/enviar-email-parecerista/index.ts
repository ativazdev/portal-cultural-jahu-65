import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

interface EmailPareceristaRequest {
  parecerista: {
    nome: string;
    email: string;
    especialidade: string[];
    prefeitura_nome: string;
  };
  credenciais: {
    email: string;
    senha: string;
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { parecerista, credenciais }: EmailPareceristaRequest = await req.json();

    // Validate required fields
    if (!parecerista?.nome || !parecerista?.email || !parecerista?.especialidade || !parecerista?.prefeitura_nome) {
      return new Response(
        JSON.stringify({ error: 'Dados do parecerista são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!credenciais?.email || !credenciais?.senha) {
      return new Response(
        JSON.stringify({ error: 'Credenciais de login são obrigatórias' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format specialties
    const especialidadesFormatadas = parecerista.especialidade.map(esp => {
      const especialidadesMap: Record<string, string> = {
        'musica': 'Música',
        'teatro': 'Teatro',
        'danca': 'Dança',
        'artes_visuais': 'Artes Visuais',
        'literatura': 'Literatura',
        'cinema': 'Cinema e Audiovisual',
        'cultura_popular': 'Cultura Popular',
        'circo': 'Circo',
        'outros': 'Outros'
      };
      return especialidadesMap[esp] || esp;
    }).join(', ');

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro de Parecerista - ${parecerista.prefeitura_nome}</title>
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
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .prefeitura {
            color: #64748b;
            font-size: 16px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1e40af;
            margin-bottom: 20px;
          }
          .info-box {
            background-color: #f1f5f9;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .credentials {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .credentials h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 16px;
          }
          .credentials p {
            margin: 5px 0;
            font-family: monospace;
            background-color: #ffffff;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          }
          .specialties {
            margin: 15px 0;
          }
          .specialty-tag {
            display: inline-block;
            background-color: #dbeafe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            color: #64748b;
            font-size: 14px;
          }
          .warning {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
          }
          .warning h4 {
            margin-top: 0;
            color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Portal Cultural</div>
            <div class="prefeitura">${parecerista.prefeitura_nome}</div>
          </div>
          
          <div class="content">
            <div class="greeting">
              Olá, <strong>${parecerista.nome}</strong>!
            </div>
            
            <p>Você foi cadastrado como <strong>Parecerista Cultural</strong> pela <strong>${parecerista.prefeitura_nome}</strong>.</p>
            
            <div class="info-box">
              <h3>📋 Informações do seu cadastro:</h3>
              <p><strong>Nome:</strong> ${parecerista.nome}</p>
              <p><strong>Email:</strong> ${parecerista.email}</p>
              <p><strong>Especialidades:</strong></p>
              <div class="specialties">
                ${parecerista.especialidade.map(esp => {
                  const especialidadesMap: Record<string, string> = {
                    'musica': 'Música',
                    'teatro': 'Teatro',
                    'danca': 'Dança',
                    'artes_visuais': 'Artes Visuais',
                    'literatura': 'Literatura',
                    'cinema': 'Cinema e Audiovisual',
                    'cultura_popular': 'Cultura Popular',
                    'circo': 'Circo',
                    'outros': 'Outros'
                  };
                  return `<span class="specialty-tag">${especialidadesMap[esp] || esp}</span>`;
                }).join('')}
              </div>
            </div>
            
            <div class="credentials">
              <h3>🔐 Suas credenciais de acesso:</h3>
              <p><strong>Email:</strong> ${credenciais.email}</p>
              <p><strong>Senha:</strong> ${credenciais.senha}</p>
            </div>
            
            <div class="warning">
              <h4>⚠️ Importante:</h4>
              <p>Este login é específico para a <strong>${parecerista.prefeitura_nome}</strong>. 
              Você poderá avaliar projetos culturais e participar do processo de seleção 
              de editais desta prefeitura.</p>
            </div>
            
            <h3>🎯 Próximos passos:</h3>
            <ol>
              <li>Acesse o portal da <strong>${parecerista.prefeitura_nome}</strong></li>
              <li>Faça login com as credenciais fornecidas acima</li>
              <li>Aguarde a ativação da sua conta pela administração</li>
              <li>Comece a avaliar projetos culturais!</li>
            </ol>
            
            <p>Se você tiver alguma dúvida, entre em contato com a administração da prefeitura.</p>
            
            <p>Agradecemos sua participação no programa de incentivo à cultura!</p>
          </div>
          
          <div class="footer">
            <p>Este é um e-mail automático. Não responda a esta mensagem.</p>
            <p>Portal Cultural - ${parecerista.prefeitura_nome}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portal Cultural <noreply@portalcultural.com.br>',
        to: [parecerista.email],
        subject: `Cadastro de Parecerista - ${parecerista.prefeitura_nome}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Erro ao enviar e-mail: ${errorData}`);
    }

    const emailResult = await emailResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'E-mail enviado com sucesso',
        emailId: emailResult.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
