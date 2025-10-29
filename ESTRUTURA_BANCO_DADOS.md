# Estrutura do Banco de Dados - Portal Cultural Jaú

## 📋 Visão Geral

Este documento descreve a estrutura completa do banco de dados do Portal Cultural de Jaú, incluindo tabelas, relacionamentos, Edge Functions e políticas de segurança.

## 🏗️ Arquitetura

O sistema utiliza uma arquitetura multi-tenant baseada em prefeituras, com três tipos principais de usuários:

1. **Usuários da Prefeitura** (gestores, assistentes): Usam autenticação do Supabase (`auth.users`)
2. **Pareceristas**: Autenticação customizada com senha criptografada
3. **Proponentes**: Autenticação customizada com senha criptografada

## 📦 Migrações

As migrações estão organizadas em 6 arquivos na pasta `supabase/migrations/`:

### 1. `20250114000001_criar_estrutura_base.sql`
- Cria ENUMs para tipos de dados
- Tabela `prefeituras`
- Tabela `pareceristas` (com senha criptografada)
- Tabela `proponentes` (com senha criptografada)
- Atualiza tabela `profiles` para incluir vínculo com prefeitura

### 2. `20250114000002_criar_tabelas_editais_projetos.sql`
- Tabela `editais`
- Tabela `arquivos_edital`
- Tabela `projetos`
- Tabelas relacionadas: `metas_projeto`, `equipe_projeto`, `documentos_habilitacao`, `planilha_orcamentaria`

### 3. `20250114000003_criar_tabelas_avaliacoes_comunicacoes.sql`
- Tabela `avaliacoes`
- Tabela `comunicacoes`
- Tabela `anexos_comunicacao`

### 4. `20250114000004_criar_tabelas_prestacao_contas.sql`
- Tabela `prestacoes_contas`
- Tabela `movimentacoes_financeiras`
- Tabela `contas_monitoradas` (Open Banking)

### 5. `20250114000005_criar_politicas_rls.sql`
- Políticas RLS para todas as tabelas
- Funções auxiliares de verificação

### 6. `20250114000006_criar_funcoes_senha.sql`
- Funções para criptografar e verificar senhas (bcrypt)
- Triggers automáticos para criptografia
- Sistema de recuperação de senha
- Funções para gerar e validar tokens de recuperação

## 🔐 Sistema de Autenticação

### Usuários da Prefeitura
Utilizam o sistema padrão do Supabase:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@prefeitura.gov.br',
  password: 'senha123'
})
```

### Pareceristas e Proponentes
Utilizam Edge Functions customizadas:

#### Cadastro de Parecerista
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastrar-parecerista`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    prefeitura_id: 'uuid-da-prefeitura',
    email: 'parecerista@email.com',
    senha: 'senha123',
    nome: 'Nome do Parecerista',
    cpf: '12345678901',
    // ... outros campos
  })
})
```

#### Login de Parecerista
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-parecerista`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    email: 'parecerista@email.com',
    senha: 'senha123'
  })
})

const { token, parecerista, prefeitura } = await response.json()
```

#### Cadastro de Proponente
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastrar-proponente`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    prefeitura_id: 'uuid-da-prefeitura',
    email: 'proponente@email.com',
    senha: 'senha123',
    tipo: 'PF', // ou 'PJ', 'Grupo', 'COOP'
    nome: 'Nome do Proponente',
    cpf: '12345678901', // obrigatório para PF
    cnpj: '12345678000190', // obrigatório para PJ
    // ... outros campos
  })
})
```

#### Login de Proponente
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-proponente`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    email: 'proponente@email.com',
    senha: 'senha123'
  })
})

const { token, proponente, prefeitura } = await response.json()
```

## 🔑 Criptografia de Senhas

As senhas de pareceristas e proponentes são criptografadas usando **bcrypt** (algoritmo `bf` do PostgreSQL), que é o mesmo usado pelo Supabase internamente.

### Como funciona:
1. Ao inserir um novo usuário, um trigger automático criptografa a senha
2. A função `gen_salt('bf')` gera um salt aleatório
3. A função `crypt()` criptografa a senha com o salt
4. Na autenticação, `crypt(senha_fornecida, hash_armazenado)` verifica se são iguais

### Funções SQL disponíveis:
```sql
-- Atualizar senha de parecerista
SELECT atualizar_senha_parecerista('uuid-parecerista', 'nova_senha');

-- Verificar senha de parecerista
SELECT verificar_senha_parecerista('uuid-parecerista', 'senha_fornecida');

-- Atualizar senha de proponente
SELECT atualizar_senha_proponente('uuid-proponente', 'nova_senha');

-- Verificar senha de proponente
SELECT verificar_senha_proponente('uuid-proponente', 'senha_fornecida');

-- Gerar token de recuperação de senha
SELECT gerar_token_recuperacao_parecerista('email@parecerista.com');
SELECT gerar_token_recuperacao_proponente('email@proponente.com');

-- Redefinir senha com token
SELECT redefinir_senha_parecerista('token-gerado', 'nova_senha');
SELECT redefinir_senha_proponente('token-gerado', 'nova_senha');
```

## 📊 Principais Tabelas

### Prefeituras
```sql
prefeituras (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  cep TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Pareceristas
```sql
pareceristas (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL, -- Bcrypt
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  especialidade modalidade_cultural[],
  status TEXT DEFAULT 'ativo',
  projetos_em_analise INTEGER DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  ultimo_acesso TIMESTAMP,
  ...
)
```

### Proponentes
```sql
proponentes (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL, -- Bcrypt
  tipo tipo_proponente NOT NULL, -- PF, PJ, Grupo, COOP
  nome TEXT NOT NULL,
  cpf TEXT, -- Obrigatório para PF
  cnpj TEXT, -- Obrigatório para PJ
  status TEXT DEFAULT 'ativo',
  ultimo_acesso TIMESTAMP,
  ...
)
```

### Editais
```sql
editais (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  data_abertura DATE NOT NULL,
  data_final_envio_projeto DATE NOT NULL,
  horario_final_envio_projeto TIME NOT NULL,
  status status_edital DEFAULT 'ativo',
  valor_maximo DECIMAL(12,2),
  modalidades modalidade_cultural[],
  ...
)
```

### Projetos
```sql
projetos (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras,
  edital_id UUID REFERENCES editais,
  proponente_id UUID REFERENCES proponentes,
  parecerista_id UUID REFERENCES pareceristas,
  nome TEXT NOT NULL,
  modalidade modalidade_cultural NOT NULL,
  valor_solicitado DECIMAL(12,2) NOT NULL,
  status status_projeto DEFAULT 'recebido',
  numero_inscricao TEXT,
  ...
)
```

### Avaliações
```sql
avaliacoes (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras,
  projeto_id UUID REFERENCES projetos,
  parecerista_id UUID REFERENCES pareceristas,
  nota_relevancia DECIMAL(3,1),
  nota_viabilidade DECIMAL(3,1),
  nota_impacto DECIMAL(3,1),
  nota_orcamento DECIMAL(3,1),
  nota_inovacao DECIMAL(3,1),
  nota_sustentabilidade DECIMAL(3,1),
  nota_final DECIMAL(4,2),
  parecer_tecnico TEXT,
  recomendacao TEXT,
  ...
)
```

## 🚀 Como Aplicar as Migrações

### Opção 1: Usando Supabase CLI
```bash
# Na pasta do projeto
supabase link --project-ref akmojojingzggvvnbpmi
supabase db push
```

### Opção 2: Usando Dashboard do Supabase
1. Acesse https://supabase.com/dashboard/project/akmojojingzggvvnbpmi
2. Vá em "SQL Editor"
3. Execute cada arquivo de migração na ordem (000001, 000002, etc.)

### Opção 3: Aplicando via Terminal (se tiver acesso ao banco)
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20250114000001_criar_estrutura_base.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/20250114000002_criar_tabelas_editais_projetos.sql
# ... e assim por diante
```

## 📡 Deploy das Edge Functions

```bash
# Deploy da função de cadastro de pareceristas
supabase functions deploy cadastrar-parecerista

# Deploy da função de autenticação de pareceristas
supabase functions deploy auth-parecerista

# Deploy da função de cadastro de proponentes
supabase functions deploy cadastrar-proponente

# Deploy da função de autenticação de proponentes
supabase functions deploy auth-proponente
```

## 🔒 Segurança (RLS)

As políticas RLS (Row Level Security) estão configuradas para:

- **Prefeituras**: Usuários só veem sua própria prefeitura
- **Pareceristas**: Podem ver e atualizar seu próprio perfil
- **Proponentes**: Podem ver e atualizar seu próprio perfil
- **Editais**: Públicos para leitura, gestão restrita à prefeitura
- **Projetos**: Proponentes veem seus projetos, pareceristas veem projetos atribuídos
- **Avaliações**: Apenas parecerista responsável e prefeitura
- **Comunicações**: Remetente e destinatário
- **Prestações**: Proponente e prefeitura

## 📝 Notas Importantes

1. **Senhas**: Nunca armazene senhas em texto plano. Use sempre as funções de criptografia.
2. **Tokens JWT**: Os tokens customizados têm validade de 7 dias.
3. **Recuperação de Senha**: Tokens de recuperação expiram em 1 hora.
4. **Multi-tenant**: Todas as operações são isoladas por `prefeitura_id`.
5. **Índices**: Criados para otimizar consultas frequentes.

## 🔄 Próximos Passos

1. Aplicar as migrações no banco de dados
2. Fazer deploy das Edge Functions
3. Atualizar os tipos TypeScript (`src/integrations/supabase/types.ts`)
4. Implementar os hooks de autenticação no frontend
5. Testar o fluxo completo de cadastro e login

## 📞 Suporte

Em caso de dúvidas ou problemas, consulte a documentação do Supabase:
- https://supabase.com/docs
- https://supabase.com/docs/guides/database/postgres
- https://supabase.com/docs/guides/functions

