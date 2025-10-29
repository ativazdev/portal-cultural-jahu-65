# 🔧 Configuração das Edge Functions

## Variáveis de Ambiente Necessárias

Para que as edge functions funcionem corretamente, você precisa configurar as seguintes variáveis de ambiente no Supabase:

### 1. Resend API Key
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Site URL
```bash
SITE_URL=https://seu-dominio.com
```

## Como Configurar

### 1. Acesse o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto

### 2. Configure as Variáveis de Ambiente
1. No menu lateral, clique em **Settings** (Configurações)
2. Clique em **Edge Functions**
3. Na seção **Environment Variables**, adicione:
   - `RESEND_API_KEY`: Sua chave da API do Resend
   - `SITE_URL`: URL do seu site (ex: https://portalcultural.com.br)

### 3. Obter Chave do Resend
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta ou faça login
3. Vá para **API Keys**
4. Crie uma nova chave
5. Copie a chave e cole na variável `RESEND_API_KEY`

## Deploy das Edge Functions

Para fazer o deploy das edge functions atualizadas:

### 1. Fazer Login no Supabase
```bash
# Navegue até o diretório do projeto
cd /Users/joaovictor/Flowcode/Prefeitura-Jau/portal-cultural-jahu-65

# Faça login no Supabase (abrirá o navegador)
supabase login

# Ou use um token de acesso
export SUPABASE_ACCESS_TOKEN=seu_token_aqui
```

### 2. Deploy da Função
```bash
# Faça o deploy da função cadastrar-parecerista
supabase functions deploy cadastrar-parecerista

# Verifique se o deploy foi bem-sucedido
supabase functions list
```

### 3. Verificar Deploy
Após o deploy, você deve ver a função listada com status "ACTIVE" no comando `supabase functions list`.

## Funcionalidades Implementadas

### Edge Function: `cadastrar-parecerista`
- ✅ Gera senha aleatória segura (12 caracteres)
- ✅ Cria hash da senha usando bcrypt
- ✅ Cadastra parecerista no banco de dados
- ✅ Envia email com credenciais via Resend
- ✅ Inclui link direto para login
- ✅ Template de email profissional e responsivo

### Campos do Email
- Nome do parecerista
- Email de login
- Senha gerada
- Especialidades formatadas
- Área de atuação
- Link direto para login: `/{nome_prefeitura}/pareceristas/login`

## Testando a Funcionalidade

1. Acesse a página `/jau/pareceristas`
2. Clique em "Novo Parecerista"
3. Preencha os dados (especialidades são múltiplas)
4. Clique em "Criar Parecerista"
5. Verifique se o parecerista foi criado na lista
6. Verifique se o email foi enviado (caixa de entrada)

## Troubleshooting

### Erro: "RESEND_API_KEY não configurada"
- Verifique se a variável está configurada no Supabase
- Faça o deploy novamente da função

### Erro: "Prefeitura não encontrada"
- Verifique se o `prefeitura_id` está correto
- Verifique se a prefeitura existe na tabela `prefeituras`

### Email não enviado
- Verifique os logs da edge function no Supabase
- Verifique se a chave do Resend está correta
- Verifique se o domínio está verificado no Resend
