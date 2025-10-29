# 🔄 NOVA ESTRUTURA: USUÁRIOS E PROPONENTES

## 📋 VISÃO GERAL

A estrutura foi ajustada para separar **USUÁRIOS** (credenciais de acesso) de **PROPONENTES** (perfis jurídicos).

### Antes (Estrutura Antiga)
```
proponentes
  ├─ email (credencial)
  ├─ senha_hash (credencial)
  ├─ tipo (PF/PJ/Grupo/COOP)
  ├─ cpf/cnpj
  └─ dados...
```

### Agora (Nova Estrutura)
```
usuarios_proponentes
  ├─ email (credencial)
  ├─ senha_hash (credencial)
  ├─ nome
  └─ prefeitura_id

    ↓ (1:N)

proponentes
  ├─ usuario_id (FK)
  ├─ tipo (PF/PJ/Grupo/COOP)
  ├─ cpf/cnpj
  └─ dados...
```

---

## ✨ BENEFÍCIOS

1. **Um usuário pode ter vários proponentes**
   - PF para projetos individuais
   - PJ para empresa
   - Grupo cultural
   - Cooperativa

2. **Credenciais únicas**
   - Um único login para acessar todos os proponentes

3. **Cadastro simplificado**
   - Cadastro inicial: apenas nome, email, senha
   - Cadastro de proponentes: dentro do sistema

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `usuarios_proponentes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `prefeitura_id` | UUID | FK → prefeituras |
| `email` | TEXT | UNIQUE |
| `senha_hash` | TEXT | Bcrypt |
| `nome` | TEXT | Nome completo |
| `ativo` | BOOLEAN | Status |
| `email_verificado` | BOOLEAN | Verificação |
| `ultimo_acesso` | TIMESTAMP | Último login |

### Tabela: `proponentes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `prefeitura_id` | UUID | FK → prefeituras |
| **`usuario_id`** | UUID | FK → usuarios_proponentes |
| `tipo` | ENUM | PF/PJ/Grupo/COOP |
| `nome` | TEXT | Nome ou Razão Social |
| `cpf` | TEXT | UNIQUE (PF) |
| `cnpj` | TEXT | UNIQUE (PJ) |
| `aprovado` | BOOLEAN | Aprovação da prefeitura |
| ... | ... | Demais campos |

---

## 🔧 FUNÇÕES SQL

### 1. `verificar_senha_usuario(email, senha)`
Autentica um usuário e retorna seus dados.

```sql
SELECT * FROM verificar_senha_usuario('usuario@email.com', 'senha123');
```

### 2. `atualizar_senha_usuario(usuario_id, nova_senha)`
Atualiza a senha de um usuário.

```sql
SELECT atualizar_senha_usuario('uuid-usuario', 'nova_senha123');
```

### 3. `buscar_proponentes_usuario(usuario_id)`
Retorna todos os proponentes de um usuário.

```sql
SELECT * FROM buscar_proponentes_usuario('uuid-usuario');
```

---

## 🌐 EDGE FUNCTIONS

### 1. `cadastrar-usuario-proponente`

**Endpoint:** `/functions/v1/cadastrar-usuario-proponente`

**Entrada:**
```json
{
  "prefeitura_id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Saída:**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@email.com"
  }
}
```

### 2. `auth-usuario-proponente`

**Endpoint:** `/functions/v1/auth-usuario-proponente`

**Entrada:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Saída:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt-token-aqui",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@email.com",
    "prefeitura_id": "uuid-prefeitura",
    "prefeitura": {
      "nome": "Prefeitura Municipal de Jaú",
      "municipio": "Jaú",
      "estado": "SP"
    },
    "proponentes": [
      {
        "id": "uuid-proponente",
        "tipo": "PF",
        "nome": "João Silva",
        "cpf": "12345678900",
        "ativo": true,
        "aprovado": true
      }
    ]
  }
}
```

---

## 🔗 ROTAS FRONTEND

### Públicas (Sem autenticação)

| URL | Página | Descrição |
|-----|--------|-----------|
| `/` | SelecionarPrefeitura | Escolher prefeitura |
| `/jau/login-proponente` | LoginProponente | Login do usuário |
| **`/jau/cadastro-usuario`** | CadastroUsuario | **Cadastro inicial (nome, email, senha)** |

### Privadas (Com autenticação)

| URL | Página | Descrição |
|-----|--------|-----------|
| `/jau/dashboard` | Dashboard | Dashboard principal |
| `/jau/meus-proponentes` | MeusProponentes | Lista de proponentes do usuário |
| **`/jau/cadastro-proponente`** | CadastroProponente | **Cadastro de proponente (CPF/CNPJ, tipo, etc.)** |

---

## 📝 FLUXO COMPLETO

### 1. CADASTRO INICIAL

```
Usuário → /jau/cadastro-usuario
  ↓
Preenche:
  • Nome: "João Silva"
  • Email: "joao@email.com"
  • Senha: "senha123"
  ↓
Edge Function: cadastrar-usuario-proponente
  ↓
Tabela: usuarios_proponentes
  ↓
Redirect: /jau/login-proponente
```

### 2. LOGIN

```
Usuário → /jau/login-proponente
  ↓
Preenche:
  • Email: "joao@email.com"
  • Senha: "senha123"
  ↓
Edge Function: auth-usuario-proponente
  ↓
SQL: verificar_senha_usuario()
  ↓
SQL: buscar_proponentes_usuario()
  ↓
Retorna: Token JWT + Lista de proponentes
  ↓
LocalStorage:
  • auth_token
  • user_type: "proponente"
  • user_data: {usuario, proponentes}
  ↓
Redirect: /jau/dashboard
```

### 3. CADASTRO DE PROPONENTE (Interno)

```
Usuário logado → /jau/cadastro-proponente
  ↓
Preenche:
  • Tipo: "PF"
  • Nome: "João Silva"
  • CPF: "123.456.789-00"
  • Telefone, endereço, etc.
  ↓
API: POST /proponentes
  ↓
Tabela: proponentes
  • usuario_id: UUID do usuário logado
  • tipo: "PF"
  • cpf: "12345678900"
  • ...
  ↓
Redirect: /jau/meus-proponentes
```

---

## 🧪 TESTE COMPLETO

### Passo 1: Cadastrar Usuário

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/cadastrar-usuario-proponente \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prefeitura_id": "uuid-da-prefeitura-jau",
    "nome": "João Silva",
    "email": "joao@teste.com",
    "senha": "senha123"
  }'
```

### Passo 2: Fazer Login

```bash
curl -X POST https://ymkytnhdslvkigzilbvy.supabase.co/functions/v1/auth-usuario-proponente \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "senha": "senha123"
  }'
```

### Passo 3: Verificar no Banco

```sql
-- Ver usuário criado
SELECT * FROM usuarios_proponentes WHERE email = 'joao@teste.com';

-- Ver proponentes do usuário (ainda vazio)
SELECT * FROM proponentes WHERE usuario_id = 'uuid-do-usuario';
```

---

## 🔐 SEGURANÇA

### RLS (Row Level Security)

#### Tabela: `usuarios_proponentes`
```sql
-- Usuários só podem ver seus próprios dados
CREATE POLICY usuarios_select_own ON usuarios_proponentes
  FOR SELECT USING (auth.uid() = id);
```

#### Tabela: `proponentes`
```sql
-- Proponentes vinculados ao usuário logado
CREATE POLICY proponentes_select_own ON proponentes
  FOR SELECT USING (usuario_id = auth.uid());

-- Apenas usuário proprietário pode editar
CREATE POLICY proponentes_update_own ON proponentes
  FOR UPDATE USING (usuario_id = auth.uid());
```

---

## 📊 MIGRAÇÕES APLICADAS

✅ **Migration:** `20250114000007_ajustar_estrutura_usuarios_proponentes.sql`

Criações:
- Tabela `usuarios_proponentes`
- Backup da tabela antiga `proponentes_backup`
- Nova tabela `proponentes` com FK `usuario_id`
- Funções SQL para autenticação
- Triggers para criptografia
- Índices para performance

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Banco de dados atualizado
2. ✅ Edge Functions deployadas
3. ✅ Frontend ajustado
4. ⏳ **Testar fluxo completo**
5. ⏳ Implementar página de listagem de proponentes
6. ⏳ Implementar seleção de proponente ativo
7. ⏳ Atualizar RLS policies

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- [ESTRUTURA_BANCO_DADOS.md](./ESTRUTURA_BANCO_DADOS.md)
- [GUIA_TESTE_API.md](./GUIA_TESTE_API.md)
- [INTEGRACAO_LOGIN_COMPLETA.md](./INTEGRACAO_LOGIN_COMPLETA.md)

