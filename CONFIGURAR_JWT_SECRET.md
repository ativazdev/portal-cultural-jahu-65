# 🔐 Configuração do SUPABASE_JWT_SECRET

## ❌ Problema

Ao tentar fazer login com Parecerista ou Proponente, você recebe o erro:
```
JWT Secret não configurado
```

Isso acontece porque a variável de ambiente `JWT_SECRET` não está configurada nas Edge Functions.

## ✅ Solução

⚠️ **IMPORTANTE**: Você **DEVE** configurar isso manualmente via Dashboard do Supabase. Não há como fazer via código.

### Passo 1: Obter o JWT Secret

1. Acesse o **Dashboard do Supabase**: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy
2. Vá em **Settings** → **API**
3. Na seção **JWT Settings**, procure o campo **JWT Secret**
4. Clique no botão de **👁️ Show** para revelar o secret
5. Copie o valor (é uma string longa que parece com um hash)

### Passo 2: Configurar nas Edge Functions via Dashboard

1. No Dashboard, clique em **Edge Functions** no menu lateral
2. Clique na aba **Secrets**
3. No campo **Key**, digite: `JWT_SECRET` (⚠️ **NÃO** use `SUPABASE_JWT_SECRET` - o Supabase não permite esse prefixo)
4. No campo **Value**, cole o valor que você copiou no Passo 1
5. Clique no botão **Save** (verde)

**Pronto!** O secret será compartilhado automaticamente por todas as Edge Functions do projeto.

### Passo 3: Fazer Deploy das Edge Functions Atualizadas

As Edge Functions foram corrigidas para usar `JWT_SECRET` ao invés de `SUPABASE_JWT_SECRET`. Agora você precisa fazer o deploy das versões atualizadas:

#### ⚠️ IMPORTANTE: As Edge Functions já foram atualizadas no código!

**As funções no Dashboard estão desatualizadas e precisam ser redeployadas.**

Para fazer o redeploy via Dashboard:

1. No Dashboard, clique em **Edge Functions** no menu lateral
2. Clique na aba **Functions**
3. Para cada função abaixo, faça o seguinte:
   - ✅ `auth-parecerista`:
     - Clique nos **três pontos (...)** ao lado da função
     - Selecione **"Redeploy"** ou **"Redeploy latest"**
   - ✅ `auth-usuario-proponente`:
     - Clique nos **três pontos (...)** ao lado da função
     - Selecione **"Redeploy"** ou **"Redeploy latest"**
   - ✅ `auth-proponente` (se existir):
     - Clique nos **três pontos (...)** ao lado da função
     - Selecione **"Redeploy"** ou **"Redeploy latest"**

#### Opção B: Via CLI

```bash
cd /Users/joaovictor/Flowcode/Prefeitura-Jau/portal-cultural-jahu-65

# Faça login primeiro (abrirá o navegador)
supabase login

# Link com o projeto
supabase link --project-ref ymkytnhdslvkigzilbvy

# Deploy das funções atualizadas
supabase functions deploy auth-parecerista --no-verify-jwt
supabase functions deploy auth-usuario-proponente --no-verify-jwt
supabase functions deploy auth-proponente --no-verify-jwt
```

### Passo 4: Verificar Configuração

Após configurar, teste o login diretamente na aplicação:

1. **Acesse a tela de login do Parecerista**: http://localhost:5173/jau/parecerista/login
2. **Acesse a tela de login do Proponente**: http://localhost:5173/jau/proponente/login
3. Tente fazer login com credenciais válidas

Se o erro "JWT Secret não configurado" não aparecer mais, a configuração foi bem-sucedida! ✅

## 📝 Nota Importante

O `JWT_SECRET` é o mesmo valor usado pelo Supabase para assinar tokens JWT.
Ele garante que os tokens gerados pelas Edge Functions sejam compatíveis com o sistema de RLS (Row Level Security) do Supabase.

## 📋 Resumo dos Passos

1. ✅ **Código atualizado**: Edge Functions agora usam `JWT_SECRET` (não `SUPABASE_JWT_SECRET`)
2. ⏳ **Você precisa fazer**:
   - Configurar o secret `JWT_SECRET` no Dashboard (Passo 2)
   - Fazer redeploy das funções (Passo 3)
   - Testar o login (Passo 4)

## 🔗 Links Úteis

- Dashboard: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/edge-functions
- Docs sobre Secrets: https://supabase.com/docs/guides/functions/secrets
