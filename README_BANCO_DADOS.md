# 🗄️ Estrutura de Banco de Dados - Portal Cultural Jaú

## ✅ O que foi criado

Estrutura completa do banco de dados para o Portal Cultural de Jaú, incluindo:

### 📂 Migrações SQL (6 arquivos)
1. **Estrutura Base** - Prefeituras, Pareceristas, Proponentes
2. **Editais e Projetos** - Sistema de submissão de projetos
3. **Avaliações e Comunicações** - Sistema de análise e mensagens
4. **Prestação de Contas** - Controle financeiro e Open Banking
5. **Políticas RLS** - Segurança e isolamento de dados
6. **Funções de Senha** - Criptografia bcrypt e recuperação

### 🔧 Edge Functions (4 funções)
1. **cadastrar-parecerista** - Cadastro de novos pareceristas
2. **auth-parecerista** - Login de pareceristas
3. **cadastrar-proponente** - Cadastro de novos proponentes
4. **auth-proponente** - Login de proponentes

### 📚 Documentação (4 arquivos)
1. **ESTRUTURA_BANCO_DADOS.md** - Documentação completa
2. **INSTRUCOES_SETUP.md** - Passo a passo para setup
3. **DIAGRAMA_BANCO_DADOS.md** - Diagramas e relacionamentos
4. **README_BANCO_DADOS.md** - Este arquivo (resumo)

## 🎯 Principais Características

### ✨ Autenticação Customizada
- **Pareceristas**: Autenticação própria com senha bcrypt
- **Proponentes**: Autenticação própria com senha bcrypt
- **Prefeitura**: Autenticação Supabase padrão
- JWT compatível com Supabase em todos os casos

### 🏢 Multi-Tenant
- Sistema isolado por `prefeitura_id`
- Várias prefeituras podem usar o mesmo banco
- RLS garante isolamento completo de dados

### 🔐 Segurança
- Senhas criptografadas com bcrypt (algoritmo bf)
- Row Level Security (RLS) em todas as tabelas
- Políticas de acesso granulares
- Triggers automáticos para criptografia

### 📊 Entidades Principais

```
PREFEITURAS
    ├── USUÁRIOS (gestores)
    ├── PARECERISTAS (senha própria)
    ├── PROPONENTES (senha própria)
    ├── EDITAIS
    │   └── PROJETOS
    │       ├── METAS
    │       ├── EQUIPE
    │       ├── DOCUMENTOS
    │       ├── PLANILHA ORÇAMENTÁRIA
    │       ├── AVALIAÇÕES
    │       ├── COMUNICAÇÕES
    │       └── PRESTAÇÕES DE CONTAS
    │           ├── MOVIMENTAÇÕES FINANCEIRAS
    │           └── CONTAS MONITORADAS (Open Banking)
    └── COMUNICAÇÕES
```

## 🚀 Como Usar

### 1️⃣ Aplicar Migrações
```bash
# Ver instruções detalhadas em:
INSTRUCOES_SETUP.md
```

### 2️⃣ Deploy das Edge Functions
```bash
supabase functions deploy cadastrar-parecerista --no-verify-jwt
supabase functions deploy auth-parecerista --no-verify-jwt
supabase functions deploy cadastrar-proponente --no-verify-jwt
supabase functions deploy auth-proponente --no-verify-jwt
```

### 3️⃣ Obter UUID da Prefeitura
```sql
SELECT id, nome FROM prefeituras;
```

### 4️⃣ Testar Cadastro
```typescript
// Cadastrar Parecerista
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
    nome: 'João Silva',
    cpf: '12345678901',
    especialidade: ['musica', 'teatro']
  })
})

// Login de Parecerista
const authResponse = await fetch(`${SUPABASE_URL}/functions/v1/auth-parecerista`, {
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

const { token, parecerista } = await authResponse.json()
```

## 📁 Arquivos Criados

### Migrações
```
supabase/migrations/
├── 20250114000001_criar_estrutura_base.sql
├── 20250114000002_criar_tabelas_editais_projetos.sql
├── 20250114000003_criar_tabelas_avaliacoes_comunicacoes.sql
├── 20250114000004_criar_tabelas_prestacao_contas.sql
├── 20250114000005_criar_politicas_rls.sql
└── 20250114000006_criar_funcoes_senha.sql
```

### Edge Functions
```
supabase/functions/
├── cadastrar-parecerista/
│   └── index.ts
├── auth-parecerista/
│   └── index.ts
├── cadastrar-proponente/
│   └── index.ts
└── auth-proponente/
    └── index.ts
```

### Documentação
```
/
├── ESTRUTURA_BANCO_DADOS.md     # Documentação completa
├── INSTRUCOES_SETUP.md          # Setup passo a passo
├── DIAGRAMA_BANCO_DADOS.md      # Diagramas visuais
└── README_BANCO_DADOS.md        # Este arquivo
```

## 📊 Estatísticas

- **20+ Tabelas** criadas
- **10+ Funções SQL** para gerenciamento
- **15+ Triggers** automáticos
- **40+ Índices** para performance
- **25+ Políticas RLS** para segurança
- **4 Edge Functions** para autenticação
- **6 Migrações SQL** organizadas

## 🎨 Tipos de Usuários

### 1. Usuários da Prefeitura
- Usam `auth.users` do Supabase
- Papéis: gestor, assistente, financeiro, administrador
- Login via Supabase Auth padrão

### 2. Pareceristas
- Autenticação customizada
- Senha criptografada com bcrypt
- Especialidades em modalidades culturais
- Avaliam projetos submetidos

### 3. Proponentes
- Autenticação customizada
- Senha criptografada com bcrypt
- Tipos: PF, PJ, Grupo, COOP
- Submetem projetos para editais

## 🔄 Fluxo Completo

```
1. Prefeitura cria Edital
2. Proponente se cadastra
3. Proponente submete Projeto
4. Prefeitura atribui Parecerista
5. Parecerista avalia Projeto
6. Prefeitura aprova/rejeita
7. Projeto aprovado → Execução
8. Monitoramento via Open Banking
9. Proponente envia Prestação de Contas
10. Prefeitura aprova Prestação
```

## 🛡️ Segurança

- ✅ Senhas nunca armazenadas em texto plano
- ✅ Bcrypt com salt aleatório
- ✅ RLS em todas as tabelas
- ✅ Isolamento por prefeitura
- ✅ Políticas de acesso granulares
- ✅ Tokens JWT com expiração
- ✅ Recuperação de senha segura

## 📖 Documentação Detalhada

Para mais informações, consulte:

- **[ESTRUTURA_BANCO_DADOS.md](./ESTRUTURA_BANCO_DADOS.md)** - Todas as tabelas, funções e APIs
- **[INSTRUCOES_SETUP.md](./INSTRUCOES_SETUP.md)** - Como aplicar as migrações
- **[DIAGRAMA_BANCO_DADOS.md](./DIAGRAMA_BANCO_DADOS.md)** - Diagramas e relacionamentos

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs no Dashboard do Supabase
2. Consulte `INSTRUCOES_SETUP.md` → Troubleshooting
3. Execute queries de teste no SQL Editor
4. Verifique se as políticas RLS estão corretas

## ✨ Próximos Passos

1. ✅ Aplicar migrações
2. ✅ Deploy das Edge Functions
3. ⏳ Atualizar types TypeScript
4. ⏳ Implementar hooks de autenticação
5. ⏳ Testar fluxo completo

---

**Projeto:** Portal Cultural Jaú  
**Banco de Dados:** Supabase (PostgreSQL)  
**ID do Projeto:** `akmojojingzggvvnbpmi`  
**Versão:** 1.0.0  
**Data:** Janeiro 2025

