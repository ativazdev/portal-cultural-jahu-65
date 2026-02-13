import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
// Função para gerar senha aleatória
function gerarSenhaAleatoria() {
  const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let senha = '';
  // Garantir pelo menos um caractere de cada tipo
  //senha += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Maiúscula
  senha += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
  senha += '0123456789'[Math.floor(Math.random() * 10)]; // Número
  //senha += '!@#$%&*'[Math.floor(Math.random() * 7)]; // Símbolo
  // Adicionar mais caracteres aleatórios
  for(let i = 4; i < 12; i++){
    senha += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  // Embaralhar a senha
  return senha.split('').sort(()=>Math.random() - 0.5).join('');
}
// Função para enviar email
async function enviarEmailParecerista(parecerista, credenciais, prefeituraNome) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY não configurada');
  }
  // Format specialties
  const especialidadesFormatadas = parecerista.especialidades?.map((esp)=>{
    const especialidadesMap = {
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
  }).join(', ') || 'Não especificadas';
  // Create email content
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cadastro de Parecerista - ${prefeituraNome}</title>
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
        .login-link {
          background-color: #dbeafe;
          border: 2px solid #2563eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .login-link a {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
        }
        .login-link a:hover {
          background-color: #1d4ed8;
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
          <div class="prefeitura">${prefeituraNome}</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Olá, <strong>${parecerista.nome}</strong>!
          </div>
          
          <p>Você foi cadastrado como <strong>Parecerista Cultural</strong> pela <strong>${prefeituraNome}</strong>.</p>
          
          <div class="info-box">
            <h3>📋 Informações do seu cadastro:</h3>
            <p><strong>Nome:</strong> ${parecerista.nome}</p>
            <p><strong>Email:</strong> ${parecerista.email}</p>
            <p><strong>Área de Atuação:</strong> ${parecerista.area_atuacao || 'Não especificada'}</p>
            <p><strong>Especialidades:</strong> ${especialidadesFormatadas}</p>
            <p><strong>Anos de Experiência:</strong> ${parecerista.experiencia_anos || 'Não especificado'}</p>
          </div>
          
          <div class="credentials">
            <h3>🔐 Suas credenciais de acesso:</h3>
            <p><strong>Email:</strong> ${credenciais.email}</p>
            <p><strong>Senha:</strong> ${credenciais.senha}</p>
          </div>
          
          <div class="login-link">
            <h3>🚀 Acesse o Portal</h3>
            <p>Clique no botão abaixo para fazer login:</p>
            <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/${prefeituraNome.toLowerCase().replace(/\s+/g, '-')}/pareceristas/login">
              Fazer Login
            </a>
          </div>
          
          <div class="warning">
            <h4>⚠️ Importante:</h4>
            <p>Este login é específico para a <strong>${prefeituraNome}</strong>. 
            Você poderá avaliar projetos culturais e participar do processo de seleção 
            de editais desta prefeitura.</p>
            <p><strong>Guarde suas credenciais em local seguro!</strong></p>
          </div>
          
          <h3>🎯 Próximos passos:</h3>
          <ol>
            <li>Acesse o portal da <strong>${prefeituraNome}</strong> usando o link acima</li>
            <li>Faça login com as credenciais fornecidas</li>
            <li>Aguarde a ativação da sua conta pela administração</li>
            <li>Comece a avaliar projetos culturais!</li>
          </ol>
          
          <p>Se você tiver alguma dúvida, entre em contato com a administração da prefeitura.</p>
          
          <p>Agradecemos sua participação no programa de incentivo à cultura!</p>
        </div>
        
        <div class="footer">
          <p>Este é um e-mail automático. Não responda a esta mensagem.</p>
          <p>Portal Cultural - ${prefeituraNome}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Portal Cultural <noreply@notifications.pnabjau.com.br>',
      to: [
        parecerista.email
      ],
      subject: `Cadastro de Parecerista - ${prefeituraNome}`,
      html: emailHtml
    })
  });
  if (!emailResponse.ok) {
    const errorData = await emailResponse.text();
    throw new Error(`Erro ao enviar e-mail: ${errorData}`);
  }
  return await emailResponse.json();
}
Deno.serve(async (req)=>{
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { prefeitura_id, email, nome, cpf, rg, telefone, endereco, cidade, estado, cep, data_nascimento, area_atuacao, especialidades, experiencia_anos, formacao_academica, mini_curriculo } = await req.json();
    // Validações básicas
    if (!prefeitura_id || !email || !nome || !cpf) {
      return new Response(JSON.stringify({
        error: 'Campos obrigatórios faltando: prefeitura_id, email, nome, cpf'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        error: 'Email inválido'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Verificar se email já existe
    const { data: emailExists } = await supabaseClient.from('pareceristas').select('id').eq('email', email.toLowerCase()).single();
    if (emailExists) {
      return new Response(JSON.stringify({
        error: 'Email já cadastrado'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Verificar se CPF já existe
    const { data: cpfExists } = await supabaseClient.from('pareceristas').select('id').eq('cpf', cpf).single();
    if (cpfExists) {
      return new Response(JSON.stringify({
        error: 'CPF já cadastrado'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Buscar dados da prefeitura para o email
    const { data: prefeitura, error: prefeituraError } = await supabaseClient.from('prefeituras').select('nome, municipio').eq('id', prefeitura_id).single();
    if (prefeituraError || !prefeitura) {
      return new Response(JSON.stringify({
        error: 'Prefeitura não encontrada'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Gerar senha aleatória
    const senhaAleatoria = gerarSenhaAleatoria();
    console.log(senhaAleatoria);
    /* Criar hash da senha usando crypt do PostgreSQL
    const { data: hashData, error: hashError } = await supabaseClient.rpc('crypt', {
      password: senhaAleatoria,
      salt: await supabaseClient.rpc('gen_salt', {
        type: 'bf'
      })
    });
    if (hashError) {
      console.error('Erro ao gerar hash da senha:', hashError);
      return new Response(JSON.stringify({
        error: 'Erro interno ao processar senha'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }*/ // Inserir parecerista
    const { data: parecerista, error: insertError } = await supabaseClient.from('pareceristas').insert({
      prefeitura_id,
      email: email.toLowerCase(),
      senha_hash: senhaAleatoria,
      nome,
      cpf,
      rg,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      data_nascimento,
      area_atuacao,
      especialidades: especialidades || [],
      experiencia_anos,
      formacao_academica,
      mini_curriculo,
      status: 'ativo'
    }).select().single();
    if (insertError) {
      console.error('Erro ao inserir parecerista:', insertError);
      return new Response(JSON.stringify({
        error: 'Erro ao cadastrar parecerista: ' + insertError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Enviar email com as credenciais
    try {
      const emailResult = await enviarEmailParecerista(parecerista, {
        email: parecerista.email,
        senha: senhaAleatoria
      }, prefeitura.nome);
      return new Response(JSON.stringify({
        success: true,
        message: 'Parecerista cadastrado com sucesso e email enviado',
        parecerista: {
          id: parecerista.id,
          nome: parecerista.nome,
          email: parecerista.email,
          cpf: parecerista.cpf
        },
        emailId: emailResult.id
      }), {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Mesmo com erro no email, o parecerista foi criado
      return new Response(JSON.stringify({
        success: true,
        message: 'Parecerista cadastrado com sucesso, mas houve erro ao enviar email',
        parecerista: {
          id: parecerista.id,
          nome: parecerista.nome,
          email: parecerista.email,
          cpf: parecerista.cpf
        },
        emailError: emailError.message
      }), {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
