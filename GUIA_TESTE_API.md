# 🧪 Guia de Teste da API - Portal Cultural Jaú

## 📋 Informações do Projeto

- **Project ID:** `ymkytnhdslvkigzilbvy`
- **Project Name:** prefeitura de jau
- **Status:** ✅ ACTIVE_HEALTHY
- **URL:** https://ymkytnhdslvkigzilbvy.supabase.co
- **Region:** us-east-2

## 🔑 Obter UUID da Prefeitura

**IMPORTANTE:** Antes de testar, você precisa obter o UUID da Prefeitura de Jaú.

### Via Dashboard do Supabase:
1. Acesse: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/editor
2. Clique na tabela `prefeituras`
3. Copie o valor da coluna `id`

### Via SQL Editor:
1. Acesse: https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/sql/new
2. Execute:
```sql
SELECT id, nome, municipio FROM prefeituras;
```
3. Copie o UUID retornado

**Salve esse UUID!** Você vai precisar dele em todos os cadastros.

---

## 🚀 Edge Functions Deployadas

### 1. Cadastrar Parecerista
**URL:** `https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-parecerista`
**Status:** ✅ ACTIVE

### 2. Autenticar Parecerista
**URL:** `https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-parecerista`
**Status:** ✅ ACTIVE

### 3. Cadastrar Proponente
**URL:** `https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-proponente`
**Status:** ✅ ACTIVE

### 4. Autenticar Proponente
**URL:** `https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-proponente`
**Status:** ✅ ACTIVE

---

## 🧪 Testes com cURL

### 1️⃣ Cadastrar Parecerista

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-parecerista \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "prefeitura_id": "SEU_UUID_DA_PREFEITURA_AQUI",
    "email": "joao.silva@parecerista.com",
    "senha": "senha123",
    "nome": "João Silva",
    "cpf": "12345678901",
    "telefone": "(14) 99999-1234",
    "especialidade": ["musica", "teatro"]
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Parecerista cadastrado com sucesso",
  "parecerista": {
    "id": "uuid-do-parecerista",
    "nome": "João Silva",
    "email": "joao.silva@parecerista.com",
    "cpf": "12345678901"
  }
}
```

### 2️⃣ Login de Parecerista

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-parecerista \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "email": "joao.silva@parecerista.com",
    "senha": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt-token-aqui",
  "parecerista": { ... },
  "prefeitura": { ... },
  "user_type": "parecerista"
}
```

### 3️⃣ Cadastrar Proponente (Pessoa Física)

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-proponente \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "prefeitura_id": "SEU_UUID_DA_PREFEITURA_AQUI",
    "email": "maria.santos@proponente.com",
    "senha": "senha456",
    "tipo": "PF",
    "nome": "Maria Santos",
    "cpf": "98765432109",
    "telefone": "(14) 99999-5678",
    "endereco": "Rua das Flores, 123",
    "cidade": "Jaú",
    "estado": "SP"
  }'
```

### 4️⃣ Cadastrar Proponente (Pessoa Jurídica)

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-proponente \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "prefeitura_id": "SEU_UUID_DA_PREFEITURA_AQUI",
    "email": "contato@culturaltda.com.br",
    "senha": "senha789",
    "tipo": "PJ",
    "nome": "Cultural Produções LTDA",
    "cnpj": "12345678000190",
    "razao_social": "Cultural Produções LTDA",
    "nome_fantasia": "Cultural LTDA",
    "telefone": "(14) 3333-4444",
    "endereco": "Av. Principal, 456",
    "cidade": "Jaú",
    "estado": "SP",
    "nome_representante": "Pedro Costa",
    "cpf_representante": "11122233344"
  }'
```

### 5️⃣ Login de Proponente

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-proponente \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw" \
  -d '{
    "email": "maria.santos@proponente.com",
    "senha": "senha456"
  }'
```

---

## 💻 Testes com JavaScript/TypeScript

### Exemplo de Uso no Frontend

```typescript
// src/lib/api.ts
const SUPABASE_URL = 'https://ymkytnhdslvkigzilbvy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw'

// Cadastrar Parecerista
export async function cadastrarParecerista(dados: {
  prefeitura_id: string
  email: string
  senha: string
  nome: string
  cpf: string
  telefone?: string
  especialidade?: string[]
  // ... outros campos opcionais
}) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastrar-parecerista`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(dados)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao cadastrar parecerista')
  }

  return await response.json()
}

// Login de Parecerista
export async function loginParecerista(email: string, senha: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-parecerista`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ email, senha })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao fazer login')
  }

  const data = await response.json()
  
  // Salvar token no localStorage
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('user_type', data.user_type)
  localStorage.setItem('user_data', JSON.stringify(data.parecerista))
  
  return data
}

// Cadastrar Proponente
export async function cadastrarProponente(dados: {
  prefeitura_id: string
  email: string
  senha: string
  tipo: 'PF' | 'PJ' | 'Grupo' | 'COOP'
  nome: string
  cpf?: string // obrigatório para PF
  cnpj?: string // obrigatório para PJ
  // ... outros campos
}) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastrar-proponente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(dados)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao cadastrar proponente')
  }

  return await response.json()
}

// Login de Proponente
export async function loginProponente(email: string, senha: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-proponente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ email, senha })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao fazer login')
  }

  const data = await response.json()
  
  // Salvar token no localStorage
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('user_type', data.user_type)
  localStorage.setItem('user_data', JSON.stringify(data.proponente))
  
  return data
}

// Usar o token nas requisições
export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}
```

---

## 📱 Exemplo de Hook React

```typescript
// src/hooks/useCustomAuth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: any | null
  userType: 'parecerista' | 'proponente' | 'prefeitura' | null
  token: string | null
  prefeitura: any | null
  login: (data: any) => void
  logout: () => void
  isAuthenticated: boolean
}

export const useCustomAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userType: null,
      token: null,
      prefeitura: null,
      isAuthenticated: false,

      login: (data) => {
        set({
          user: data.parecerista || data.proponente,
          userType: data.user_type,
          token: data.token,
          prefeitura: data.prefeitura,
          isAuthenticated: true
        })
      },

      logout: () => {
        set({
          user: null,
          userType: null,
          token: null,
          prefeitura: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: 'custom-auth-storage'
    }
  )
)
```

---

## 🔍 Verificar Status das Funções

### Via Dashboard:
https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/functions

### Via MCP (já verificado):
✅ cadastrar-parecerista - ACTIVE  
✅ auth-parecerista - ACTIVE  
✅ cadastrar-proponente - ACTIVE  
✅ auth-proponente - ACTIVE  

---

## ⚠️ Possíveis Erros

### "Campos obrigatórios faltando"
- Certifique-se de enviar todos os campos obrigatórios
- Para PF: email, senha, nome, cpf
- Para PJ: email, senha, nome, cnpj

### "Email já cadastrado"
- O email já existe no banco
- Use outro email ou faça login

### "CPF/CNPJ já cadastrado"
- O CPF/CNPJ já está registrado
- Verifique se não está duplicado

### "Credenciais inválidas"
- Email ou senha incorretos
- Verifique se o usuário existe

### "Usuário inativo ou bloqueado"
- O status do usuário não é 'ativo'
- Entre em contato com a prefeitura

---

## 📊 Verificar Dados no Banco

Você pode verificar os dados cadastrados executando no SQL Editor:

```sql
-- Ver todos os pareceristas
SELECT id, nome, email, cpf, status, created_at 
FROM pareceristas 
ORDER BY created_at DESC;

-- Ver todos os proponentes
SELECT id, nome, email, tipo, cpf, cnpj, status, created_at 
FROM proponentes 
ORDER BY created_at DESC;

-- Ver prefeitura
SELECT * FROM prefeituras;
```

---

## 🔐 Segurança

✅ Senhas criptografadas com bcrypt  
✅ Validações de email único  
✅ Validações de CPF/CNPJ único  
✅ Tokens JWT com expiração (7 dias)  
✅ Status de usuário (ativo/inativo/bloqueado)  
✅ Row Level Security habilitado  

---

## 📞 URLs Úteis

- **Dashboard:** https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy
- **SQL Editor:** https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/editor
- **Edge Functions:** https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/functions
- **Logs:** https://supabase.com/dashboard/project/ymkytnhdslvkigzilbvy/logs/explorer

---

## 🎯 Próximo: Integrar no Frontend

Agora você pode:

1. Atualizar os formulários de cadastro para usar as Edge Functions
2. Atualizar os formulários de login
3. Criar os hooks de autenticação
4. Implementar o fluxo de recuperação de senha

Tudo pronto para começar a desenvolver! 🚀

