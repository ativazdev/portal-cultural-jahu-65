# 🚀 Instruções de Setup - Portal Cultural Jaú

## Passo 1: Aplicar Migrações no Supabase

### Opção A: Via Dashboard do Supabase (Recomendado)

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/akmojojingzggvvnbpmi

2. No menu lateral, clique em **"SQL Editor"**

3. Clique em **"New Query"**

4. Aplique as migrações **NA ORDEM EXATA**:

   **a) Primeira migração - Estrutura Base**
   ```bash
   # Copie todo o conteúdo do arquivo:
   supabase/migrations/20250114000001_criar_estrutura_base.sql
   # Cole no SQL Editor e clique em "Run"
   ```

   **b) Segunda migração - Editais e Projetos**
   ```bash
   # Copie todo o conteúdo do arquivo:
   supabase/migrations/20250114000002_criar_tabelas_editais_projetos.sql
   # Cole no SQL Editor e clique em "Run"
   ```

   **c) Terceira migração - Avaliações e Comunicações**
   ```bash
   # Copie todo o conteúdo do arquivo:
   supabase/migrations/20250114000003_criar_tabelas_avaliacoes_comunicacoes.sql
   # Cole no SQL Editor e clique em "Run"
   ```

   **d) Quarta migração - Prestação de Contas**
   ```bash
   # Copie todo o conteúdo do arquivo:
   supabase/migrations/20250114000004_criar_tabelas_prestacao_contas.sql
   # Cole no SQL Editor e clique em "Run"
   ```

   **e) Quinta migração - Políticas RLS**
   ```bash
   # Copie todo o conteúdo do arquivo:
   supabase/migrations/20250114000005_criar_politicas_rls.sql
   # Cole no SQL Editor e clique em "Run"
   ```

   **f) Sexta migração - Funções de Senha**
   ```bash
   # Copie todo o conteúdo do arquivo:
   supabase/migrations/20250114000006_criar_funcoes_senha.sql
   # Cole no SQL Editor e clique em "Run"
   ```

5. Verifique se não houve erros. Se houver, corrija antes de prosseguir.

### Opção B: Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login no Supabase
supabase login

# Conectar ao projeto
supabase link --project-ref akmojojingzggvvnbpmi

# Aplicar todas as migrações
supabase db push
```

## Passo 2: Deploy das Edge Functions

### Instalar Supabase CLI (se não tiver)
```bash
npm install -g supabase
```

### Fazer login
```bash
supabase login
```

### Conectar ao projeto
```bash
cd /Users/user/Prefeitura-Jau/portal-cultural-jahu-65
supabase link --project-ref akmojojingzggvvnbpmi
```

### Deploy das funções
```bash
# Deploy da função de cadastro de pareceristas
supabase functions deploy cadastrar-parecerista --no-verify-jwt

# Deploy da função de autenticação de pareceristas
supabase functions deploy auth-parecerista --no-verify-jwt

# Deploy da função de cadastro de proponentes
supabase functions deploy cadastrar-proponente --no-verify-jwt

# Deploy da função de autenticação de proponentes
supabase functions deploy auth-proponente --no-verify-jwt
```

**Nota:** A flag `--no-verify-jwt` é necessária porque essas funções são públicas (para permitir cadastro e login).

## Passo 3: Configurar Variáveis de Ambiente

### No Dashboard do Supabase

1. Vá em **"Settings" > "Edge Functions"**

2. Adicione as seguintes variáveis de ambiente (se não estiverem configuradas):
   - `SUPABASE_URL`: URL do seu projeto
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (encontrada em Settings > API)
   - `SUPABASE_JWT_SECRET`: JWT Secret (encontrado em Settings > API)

## Passo 4: Testar as Funções

### Testar Cadastro de Parecerista

```bash
curl -X POST https://akmojojingzggvvnbpmi.supabase.co/functions/v1/cadastrar-parecerista \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "prefeitura_id": "COPIE_O_UUID_DA_PREFEITURA_DO_BANCO",
    "email": "parecerista@teste.com",
    "senha": "senha123",
    "nome": "João Silva",
    "cpf": "12345678901",
    "especialidade": ["musica", "teatro"]
  }'
```

### Testar Login de Parecerista

```bash
curl -X POST https://akmojojingzggvvnbpmi.supabase.co/functions/v1/auth-parecerista \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "parecerista@teste.com",
    "senha": "senha123"
  }'
```

### Testar Cadastro de Proponente

```bash
curl -X POST https://akmojojingzggvvnbpmi.supabase.co/functions/v1/cadastrar-proponente \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "prefeitura_id": "COPIE_O_UUID_DA_PREFEITURA_DO_BANCO",
    "email": "proponente@teste.com",
    "senha": "senha123",
    "tipo": "PF",
    "nome": "Maria Santos",
    "cpf": "98765432109"
  }'
```

### Testar Login de Proponente

```bash
curl -X POST https://akmojojingzggvvnbpmi.supabase.co/functions/v1/auth-proponente \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "proponente@teste.com",
    "senha": "senha123"
  }'
```

## Passo 5: Obter o UUID da Prefeitura

Após aplicar a primeira migração, uma prefeitura padrão é criada. Para obter o UUID:

1. Vá no **"SQL Editor"** no dashboard do Supabase

2. Execute:
   ```sql
   SELECT id, nome, municipio FROM prefeituras;
   ```

3. Copie o `id` (UUID) retornado - você precisará dele para cadastros

## Passo 6: Atualizar Types do TypeScript

```bash
# Na pasta do projeto
npx supabase gen types typescript --project-id akmojojingzggvvnbpmi > src/integrations/supabase/types.ts
```

## Passo 7: Verificar se Tudo Está Funcionando

### Verificar Tabelas Criadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver:
- prefeituras
- pareceristas
- proponentes
- editais
- projetos
- avaliacoes
- comunicacoes
- prestacoes_contas
- movimentacoes_financeiras
- contas_monitoradas
- E outras tabelas relacionadas...

### Verificar Funções Criadas
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

Você deve ver:
- atualizar_senha_parecerista
- atualizar_senha_proponente
- verificar_senha_parecerista
- verificar_senha_proponente
- gerar_token_recuperacao_parecerista
- gerar_token_recuperacao_proponente
- redefinir_senha_parecerista
- redefinir_senha_proponente
- E outras funções...

### Verificar Edge Functions Deployadas
```bash
supabase functions list
```

Você deve ver:
- cadastrar-parecerista
- cadastrar-proponente
- auth-parecerista
- auth-proponente

## 🎉 Pronto!

Sua estrutura de banco de dados está configurada e pronta para uso!

## 📝 Próximos Passos

1. **Criar usuário administrador da prefeitura**
   ```typescript
   // Use o Supabase Auth normal
   await supabase.auth.signUp({
     email: 'admin@jau.sp.gov.br',
     password: 'senha_segura',
     options: {
       data: {
         user_type: 'prefeitura',
         full_name: 'Administrador'
       }
     }
   })
   
   // Depois, atualizar o profile para adicionar prefeitura_id e papel
   // (fazer isso manualmente no SQL Editor)
   ```

2. **Testar cadastro de parecerista via interface**

3. **Testar cadastro de proponente via interface**

4. **Criar alguns editais de teste**

5. **Submeter projetos de teste**

## ⚠️ Troubleshooting

### Erro: "function crypt does not exist"
- A extensão pgcrypto não foi criada
- Execute: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

### Erro: "permission denied"
- Verifique se você está usando a Service Role Key para operações administrativas
- Verifique as políticas RLS

### Erro ao fazer deploy das Edge Functions
- Certifique-se de que está logado: `supabase login`
- Certifique-se de que está no projeto correto: `supabase link --project-ref akmojojingzggvvnbpmi`
- Tente com a flag `--no-verify-jwt`

### Senha não está sendo criptografada
- Verifique se os triggers foram criados corretamente
- Execute a migração `20250114000006_criar_funcoes_senha.sql` novamente

## 📞 Suporte

Se encontrar algum problema, verifique:
1. Logs do Supabase (Dashboard > Logs)
2. SQL Editor para testar queries manualmente
3. Console do navegador para erros de API
4. Documentação do Supabase: https://supabase.com/docs

