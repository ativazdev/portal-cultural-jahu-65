# 🎭 Portal Cultural Jaú - Prompt Completo do Projeto

## 📋 Visão Geral do Sistema

O **Portal Cultural Jaú** é uma plataforma web completa para gestão de editais culturais, desenvolvida com **React + TypeScript + Vite** e **Supabase** como backend. O sistema permite que prefeituras gerenciem editais culturais, proponentes submetam projetos, pareceristas avaliem propostas e todo o processo seja acompanhado com prestação de contas e monitoramento financeiro via Open Banking.

## 🏗️ Arquitetura do Sistema

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router DOM
- **Estado**: Context API + Custom Hooks

### Backend
- **Database**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth + Custom JWT
- **Edge Functions**: Deno (TypeScript)
- **Segurança**: Row Level Security (RLS)
- **Criptografia**: bcrypt para senhas

## 👥 Tipos de Usuários

### 1. **Usuários da Prefeitura** (auth.users)
- **Gestores**: Acesso total ao sistema
- **Assistentes**: Gestão de editais e projetos
- **Financeiros**: Controle de prestações de contas
- **Administradores**: Configurações do sistema

### 2. **Pareceristas** (autenticação customizada)
- Avaliam projetos culturais
- Especialistas em modalidades específicas
- Sistema de pontuação e pareceres técnicos

### 3. **Proponentes** (autenticação customizada)
- **Pessoa Física (PF)**: Artistas individuais
- **Pessoa Jurídica (PJ)**: Empresas culturais
- **Grupos**: Coletivos artísticos
- **Cooperativas (COOP)**: Organizações cooperativas

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**

#### 1. **PREFEITURAS**
```sql
prefeituras (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,                    -- Nome da prefeitura
  municipio TEXT NOT NULL,              -- Município
  estado TEXT NOT NULL,                  -- Estado (UF)
  cnpj TEXT UNIQUE NOT NULL,            -- CNPJ da prefeitura
  email TEXT NOT NULL,                  -- Email de contato
  telefone TEXT,                        -- Telefone
  endereco TEXT,                        -- Endereço completo
  cep TEXT,                            -- CEP
  ativo BOOLEAN DEFAULT true,           -- Status ativo/inativo
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 2. **PROFILES** (Usuários da Prefeitura)
```sql
profiles (
  id UUID PRIMARY KEY,                  -- Referência auth.users(id)
  user_type user_type NOT NULL,         -- 'prefeitura', 'proponente', 'parecerista'
  email TEXT NOT NULL,                  -- Email do usuário
  full_name TEXT,                       -- Nome completo
  prefeitura_id UUID REFERENCES prefeituras(id),
  papel papel_usuario,                  -- 'gestor', 'assistente', 'financeiro', 'administrador'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 3. **PARECERISTAS**
```sql
pareceristas (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  
  -- Autenticação
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,             -- Senha criptografada (bcrypt)
  
  -- Dados Pessoais
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  rg TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  data_nascimento DATE,
  
  -- Dados Profissionais
  area_atuacao TEXT,
  especialidade modalidade_cultural[],  -- Array de especialidades
  experiencia_anos INTEGER,
  formacao_academica TEXT,
  mini_curriculo TEXT,
  
  -- Controle
  status TEXT DEFAULT 'ativo',        -- 'ativo', 'inativo', 'bloqueado'
  projetos_em_analise INTEGER DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  data_ativacao DATE DEFAULT CURRENT_DATE,
  ultimo_acesso TIMESTAMP,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 4. **PROPONENTES**
```sql
proponentes (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  
  -- Autenticação
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,             -- Senha criptografada (bcrypt)
  
  -- Tipo de Proponente
  tipo tipo_proponente NOT NULL,        -- 'PF', 'PJ', 'Grupo', 'COOP'
  
  -- Dados Comuns
  nome TEXT NOT NULL,
  nome_artistico TEXT,
  telefone TEXT,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  
  -- Dados PF (Pessoa Física)
  cpf TEXT,                            -- Obrigatório para PF
  rg TEXT,
  data_nascimento DATE,
  mini_curriculo TEXT,
  comunidade_tradicional TEXT,
  outra_comunidade TEXT,
  genero TEXT,
  raca TEXT,
  pcd BOOLEAN DEFAULT false,
  tipo_deficiencia TEXT,
  outra_deficiencia TEXT,
  escolaridade TEXT,
  renda_mensal TEXT,
  programa_social TEXT,
  outro_programa_social TEXT,
  concorre_cotas BOOLEAN DEFAULT false,
  tipo_cotas TEXT,
  funcao_artistica TEXT,
  outra_funcao_artistica TEXT,
  representa_coletivo BOOLEAN DEFAULT false,
  nome_coletivo TEXT,
  ano_coletivo TEXT,
  quantidade_pessoas INTEGER,
  membros_coletivo TEXT,
  profissao TEXT,
  
  -- Dados PJ (Pessoa Jurídica)
  cnpj TEXT,                           -- Obrigatório para PJ
  inscricao_estadual TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  endereco_sede TEXT,
  numero_representantes INTEGER,
  nome_representante TEXT,
  cpf_representante TEXT,
  email_representante TEXT,
  telefone_representante TEXT,
  genero_representante TEXT,
  raca_representante TEXT,
  pcd_representante BOOLEAN DEFAULT false,
  tipo_deficiencia_representante TEXT,
  outra_deficiencia_representante TEXT,
  escolaridade_representante TEXT,
  
  -- Controle
  status TEXT DEFAULT 'ativo',          -- 'ativo', 'inativo', 'bloqueado'
  ultimo_acesso TIMESTAMP,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 5. **EDITAIS**
```sql
editais (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  
  codigo TEXT NOT NULL,                -- Código único do edital
  nome TEXT NOT NULL,                  -- Nome do edital
  descricao TEXT,                      -- Descrição detalhada
  data_abertura DATE NOT NULL,         -- Data de abertura
  data_final_envio_projeto DATE NOT NULL, -- Prazo final para envio
  horario_final_envio_projeto TIME NOT NULL, -- Horário limite
  status status_edital DEFAULT 'ativo', -- 'ativo', 'arquivado', 'rascunho'
  total_projetos INTEGER DEFAULT 0,    -- Contador de projetos
  valor_maximo DECIMAL(12,2),          -- Valor máximo por projeto
  prazo_avaliacao INTEGER,             -- Prazo em dias para avaliação
  modalidades modalidade_cultural[],   -- Modalidades aceitas
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  -- Código único por prefeitura
  CONSTRAINT unique_edital_codigo_prefeitura UNIQUE(prefeitura_id, codigo)
)
```

#### 6. **ARQUIVOS_EDITAL**
```sql
arquivos_edital (
  id UUID PRIMARY KEY,
  edital_id UUID REFERENCES editais(id),
  nome TEXT NOT NULL,                  -- Nome do arquivo
  url TEXT NOT NULL,                   -- URL do arquivo
  tamanho BIGINT,                      -- Tamanho em bytes
  tipo_mime TEXT,                      -- Tipo MIME
  created_at TIMESTAMP
)
```

#### 7. **PROJETOS**
```sql
projetos (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  edital_id UUID REFERENCES editais(id),
  proponente_id UUID REFERENCES proponentes(id),
  parecerista_id UUID REFERENCES pareceristas(id),
  
  -- Dados Básicos
  nome TEXT NOT NULL,                  -- Nome do projeto
  modalidade modalidade_cultural NOT NULL, -- Modalidade cultural
  categoria TEXT,                      -- Categoria específica
  descricao TEXT NOT NULL,             -- Descrição do projeto
  objetivos TEXT NOT NULL,             -- Objetivos do projeto
  perfil_publico TEXT,                 -- Perfil do público-alvo
  publico_prioritario TEXT[],          -- Públicos prioritários
  outro_publico_prioritario TEXT,      -- Outros públicos
  
  -- Acessibilidade
  acessibilidade_arquitetonica TEXT[],  -- Acessibilidade arquitetônica
  outra_acessibilidade_arquitetonica TEXT,
  acessibilidade_comunicacional TEXT[], -- Acessibilidade comunicacional
  outra_acessibilidade_comunicacional TEXT,
  acessibilidade_atitudinal TEXT[],    -- Acessibilidade atitudinal
  implementacao_acessibilidade TEXT,   -- Como implementar acessibilidade
  
  -- Execução
  local_execucao TEXT,                 -- Local de execução
  data_inicio DATE,                    -- Data de início
  data_final DATE,                     -- Data de conclusão
  estrategia_divulgacao TEXT,          -- Estratégia de divulgação
  
  -- Financeiro
  valor_solicitado DECIMAL(12,2) NOT NULL, -- Valor solicitado
  outras_fontes BOOLEAN DEFAULT false, -- Tem outras fontes de financiamento
  tipos_outras_fontes TEXT[],          -- Tipos de outras fontes
  detalhes_outras_fontes TEXT,         -- Detalhes das outras fontes
  venda_produtos BOOLEAN DEFAULT false, -- Vende produtos
  detalhes_venda_produtos TEXT,        -- Detalhes da venda
  
  -- Status e Controle
  status status_projeto DEFAULT 'recebido', -- Status do projeto
  data_submissao TIMESTAMP DEFAULT now(), -- Data de submissão
  necessita_comprovante_residencia BOOLEAN DEFAULT false,
  numero_inscricao TEXT,               -- Número de inscrição
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Número de inscrição único por edital
  CONSTRAINT unique_numero_inscricao_edital UNIQUE(edital_id, numero_inscricao)
)
```

#### 8. **METAS_PROJETO**
```sql
metas_projeto (
  id UUID PRIMARY KEY,
  projeto_id UUID REFERENCES projetos(id),
  descricao TEXT NOT NULL,             -- Descrição da meta
  ordem INTEGER NOT NULL,              -- Ordem das metas
  created_at TIMESTAMP
)
```

#### 9. **EQUIPE_PROJETO**
```sql
equipe_projeto (
  id UUID PRIMARY KEY,
  projeto_id UUID REFERENCES projetos(id),
  nome TEXT NOT NULL,                  -- Nome do membro
  funcao TEXT NOT NULL,                -- Função no projeto
  cpf_cnpj TEXT,                       -- CPF ou CNPJ
  indigena BOOLEAN DEFAULT false,       -- É indígena
  lgbtqiapn BOOLEAN DEFAULT false,     -- É LGBTQIAPN+
  preto_pardo BOOLEAN DEFAULT false,   -- É preto/pardo
  deficiencia BOOLEAN DEFAULT false,   -- Tem deficiência
  mini_curriculo TEXT,                 -- Mini currículo
  created_at TIMESTAMP
)
```

#### 10. **DOCUMENTOS_HABILITACAO**
```sql
documentos_habilitacao (
  id UUID PRIMARY KEY,
  projeto_id UUID REFERENCES projetos(id),
  nome TEXT NOT NULL,                  -- Nome do documento
  descricao TEXT,                      -- Descrição
  tipo TEXT,                           -- Tipo: 'rg', 'cpf', 'cnpj', etc
  obrigatorio BOOLEAN DEFAULT false,   -- É obrigatório
  status status_documento DEFAULT 'pendente', -- Status do documento
  arquivo_nome TEXT,                   -- Nome do arquivo
  arquivo_url TEXT,                    -- URL do arquivo
  arquivo_tamanho BIGINT,              -- Tamanho do arquivo
  data_solicitacao TIMESTAMP DEFAULT now(),
  data_upload TIMESTAMP,             -- Data do upload
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 11. **PLANILHA_ORCAMENTARIA**
```sql
planilha_orcamentaria (
  id UUID PRIMARY KEY,
  projeto_id UUID REFERENCES projetos(id),
  
  categoria TEXT NOT NULL,             -- Categoria: 'recursos_humanos', 'servicos', etc
  item TEXT NOT NULL,                  -- Item específico
  descricao TEXT,                      -- Descrição do item
  quantidade INTEGER,                   -- Quantidade
  valor_unitario DECIMAL(12,2),        -- Valor unitário
  valor_total DECIMAL(12,2),           -- Valor total
  justificativa TEXT,                  -- Justificativa do item
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 12. **AVALIACOES**
```sql
avaliacoes (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  projeto_id UUID REFERENCES projetos(id),
  parecerista_id UUID REFERENCES pareceristas(id),
  
  -- Critérios de Avaliação (0-10)
  nota_relevancia DECIMAL(3,1),        -- Nota de relevância
  nota_viabilidade DECIMAL(3,1),       -- Nota de viabilidade
  nota_impacto DECIMAL(3,1),           -- Nota de impacto
  nota_orcamento DECIMAL(3,1),         -- Nota do orçamento
  nota_inovacao DECIMAL(3,1),          -- Nota de inovação
  nota_sustentabilidade DECIMAL(3,1),  -- Nota de sustentabilidade
  nota_final DECIMAL(4,2),             -- Nota final
  
  -- Parecer
  parecer_tecnico TEXT,                -- Parecer técnico detalhado
  recomendacao TEXT,                   -- 'aprovacao', 'rejeicao'
  
  -- Controle
  status TEXT DEFAULT 'em_analise',    -- 'em_analise', 'concluido'
  data_avaliacao TIMESTAMP,           -- Data da avaliação
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Uma avaliação por parecerista por projeto
  CONSTRAINT unique_avaliacao UNIQUE(projeto_id, parecerista_id)
)
```

#### 13. **COMUNICACOES**
```sql
comunicacoes (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  
  -- Remetente
  remetente_tipo TEXT NOT NULL,        -- 'proponente', 'parecerista', 'prefeitura'
  remetente_id UUID NOT NULL,          -- ID do remetente
  
  -- Destinatário
  destinatario_tipo TEXT NOT NULL,    -- 'proponente', 'parecerista', 'prefeitura'
  destinatario_id UUID NOT NULL,      -- ID do destinatário
  
  -- Projeto relacionado
  projeto_id UUID REFERENCES projetos(id),
  
  -- Conteúdo
  tipo tipo_comunicacao NOT NULL,      -- 'recurso', 'duvida', 'solicitacao', 'notificacao'
  assunto TEXT NOT NULL,               -- Assunto da comunicação
  mensagem TEXT NOT NULL,              -- Mensagem
  
  -- Status
  status status_comunicacao DEFAULT 'enviado', -- Status da comunicação
  prioridade TEXT DEFAULT 'normal',   -- 'baixa', 'normal', 'alta', 'urgente'
  
  -- Resposta
  resposta TEXT,                       -- Resposta da comunicação
  respondido_por_tipo TEXT,           -- Tipo de quem respondeu
  respondido_por_id UUID,             -- ID de quem respondeu
  data_resposta TIMESTAMP,            -- Data da resposta
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 14. **ANEXOS_COMUNICACAO**
```sql
anexos_comunicacao (
  id UUID PRIMARY KEY,
  comunicacao_id UUID REFERENCES comunicacoes(id),
  nome TEXT NOT NULL,                  -- Nome do anexo
  url TEXT NOT NULL,                   -- URL do anexo
  tamanho BIGINT,                      -- Tamanho do arquivo
  tipo_mime TEXT,                      -- Tipo MIME
  created_at TIMESTAMP
)
```

#### 15. **PRESTACOES_CONTAS**
```sql
prestacoes_contas (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  projeto_id UUID REFERENCES projetos(id),
  proponente_id UUID REFERENCES proponentes(id),
  
  tipo TEXT,                           -- 'parcial', 'final'
  valor_executado DECIMAL(12,2),       -- Valor executado
  data_entrega TIMESTAMP,             -- Data de entrega
  prazo_entrega DATE,                  -- Prazo para entrega
  status status_prestacao DEFAULT 'pendente', -- Status da prestação
  status_open_banking status_open_banking DEFAULT 'nao_monitorado', -- Status Open Banking
  
  -- Documentos
  relatorio_atividades TEXT,           -- Relatório de atividades
  relatorio_financeiro TEXT,          -- Relatório financeiro
  comprovantes_url TEXT,               -- URL dos comprovantes
  
  -- Análise
  parecer_analise TEXT,                -- Parecer da análise
  analisado_por UUID REFERENCES auth.users(id), -- Quem analisou
  data_analise TIMESTAMP,             -- Data da análise
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 16. **MOVIMENTACOES_FINANCEIRAS**
```sql
movimentacoes_financeiras (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  projeto_id UUID REFERENCES projetos(id),
  prestacao_id UUID REFERENCES prestacoes_contas(id),
  
  tipo TEXT NOT NULL,                  -- 'credito', 'debito'
  descricao TEXT NOT NULL,             -- Descrição da movimentação
  valor DECIMAL(12,2) NOT NULL,        -- Valor da movimentação
  data_movimentacao TIMESTAMP NOT NULL, -- Data da movimentação
  origem_destino TEXT,                 -- Origem/destino
  metodo_pagamento TEXT,               -- 'pix', 'ted', 'doc', 'boleto'
  documento_fiscal TEXT,               -- Documento fiscal
  categoria_despesa TEXT,              -- Categoria da despesa
  
  -- Validação
  status_validacao TEXT DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado'
  observacao TEXT,                     -- Observações
  
  created_at TIMESTAMP
)
```

#### 17. **CONTAS_MONITORADAS** (Open Banking)
```sql
contas_monitoradas (
  id UUID PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id),
  projeto_id UUID REFERENCES projetos(id),
  proponente_id UUID REFERENCES proponentes(id),
  
  banco TEXT NOT NULL,                 -- Nome do banco
  agencia TEXT NOT NULL,               -- Agência
  conta TEXT NOT NULL,                 -- Conta
  consentimento_id TEXT,               -- ID do consentimento Open Banking
  consentimento_ativo BOOLEAN DEFAULT false, -- Consentimento ativo
  saldo_atual DECIMAL(12,2),           -- Saldo atual
  valor_total_recebido DECIMAL(12,2),   -- Total recebido
  valor_total_gasto DECIMAL(12,2),     -- Total gasto
  status status_open_banking DEFAULT 'nao_monitorado', -- Status do monitoramento
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **ENUMs Disponíveis**

#### **status_edital**
- `ativo` - Edital ativo para recebimento de projetos
- `arquivado` - Edital arquivado
- `rascunho` - Edital em elaboração

#### **tipo_proponente**
- `PF` - Pessoa Física
- `PJ` - Pessoa Jurídica
- `Grupo` - Grupo informal
- `COOP` - Cooperativa

#### **status_projeto**
- `recebido` - Projeto recebido
- `em_avaliacao` - Em processo de avaliação
- `avaliado` - Avaliação concluída
- `aprovado` - Projeto aprovado
- `rejeitado` - Projeto rejeitado
- `em_execucao` - Projeto em execução
- `concluido` - Projeto concluído

#### **status_documento**
- `pendente` - Documento pendente
- `enviado` - Documento enviado
- `aprovado` - Documento aprovado
- `rejeitado` - Documento rejeitado

#### **status_prestacao**
- `pendente` - Prestação pendente
- `em_analise` - Em análise
- `aprovado` - Aprovada
- `rejeitado` - Rejeitada
- `exigencia` - Com exigências

#### **status_open_banking**
- `conforme` - Conforme com o projeto
- `alerta` - Com alertas
- `irregularidade` - Com irregularidades
- `nao_monitorado` - Não monitorado

#### **tipo_comunicacao**
- `recurso` - Recurso contra decisão
- `duvida` - Dúvida sobre processo
- `solicitacao` - Solicitação
- `notificacao` - Notificação

#### **status_comunicacao**
- `enviado` - Enviado
- `lido` - Lido
- `em_analise` - Em análise
- `respondido` - Respondido

#### **modalidade_cultural**
- `musica` - Música
- `teatro` - Teatro
- `danca` - Dança
- `artes_visuais` - Artes Visuais
- `literatura` - Literatura
- `cinema` - Cinema
- `cultura_popular` - Cultura Popular
- `circo` - Circo
- `outros` - Outros

#### **papel_usuario**
- `gestor` - Gestor cultural
- `assistente` - Assistente
- `financeiro` - Financeiro
- `administrador` - Administrador

## 🔐 Sistema de Autenticação

### **Usuários da Prefeitura**
Utilizam autenticação nativa do Supabase:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@prefeitura.gov.br',
  password: 'senha123'
})
```

### **Pareceristas e Proponentes**
Utilizam Edge Functions customizadas com JWT:

#### **Cadastro de Parecerista**
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
    especialidade: ['musica', 'teatro'],
    // ... outros campos
  })
})
```

#### **Login de Parecerista**
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

#### **Cadastro de Proponente**
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

#### **Login de Proponente**
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

## 🔒 Segurança (Row Level Security)

### **Políticas RLS Implementadas**

#### **Isolamento por Prefeitura**
- Todas as tabelas principais incluem `prefeitura_id`
- Usuários só acessam dados de sua prefeitura
- Políticas automáticas baseadas no contexto do usuário

#### **Controle de Acesso por Tipo de Usuário**

**Prefeitura:**
- Acesso total aos dados da prefeitura
- Pode gerenciar editais, projetos, avaliações
- Pode atribuir pareceristas
- Pode analisar prestações de contas

**Pareceristas:**
- Veem apenas projetos atribuídos a eles
- Podem avaliar projetos
- Podem se comunicar com proponentes e prefeitura
- Acesso limitado aos dados pessoais

**Proponentes:**
- Veem apenas seus próprios projetos
- Podem submeter projetos para editais ativos
- Podem enviar prestações de contas
- Podem se comunicar com pareceristas e prefeitura

## 🚀 Edge Functions

### **1. cadastrar-parecerista**
**Endpoint:** `POST /functions/v1/cadastrar-parecerista`
- Cadastra novo parecerista
- Criptografa senha com bcrypt
- Valida CPF e email únicos
- Retorna dados do parecerista criado

### **2. auth-parecerista**
**Endpoint:** `POST /functions/v1/auth-parecerista`
- Autentica parecerista
- Verifica senha com bcrypt
- Retorna JWT customizado
- Atualiza último acesso

### **3. cadastrar-proponente**
**Endpoint:** `POST /functions/v1/cadastrar-proponente`
- Cadastra novo proponente (PF/PJ/Grupo/COOP)
- Criptografa senha com bcrypt
- Valida CPF/CNPJ e email únicos
- Retorna dados do proponente criado

### **4. auth-proponente**
**Endpoint:** `POST /functions/v1/auth-proponente`
- Autentica proponente
- Verifica senha com bcrypt
- Retorna JWT customizado
- Atualiza último acesso

## 📊 Fluxo de Dados Principal

```
1. PREFEITURA cria EDITAL
   ↓
2. PROPONENTE se cadastra no sistema
   ↓
3. PROPONENTE submete PROJETO para EDITAL
   ↓
4. PREFEITURA atribui PARECERISTA ao PROJETO
   ↓
5. PARECERISTA realiza AVALIAÇÃO do projeto
   ↓
6. PREFEITURA aprova/rejeita PROJETO baseado na avaliação
   ↓
7. PROJETO APROVADO inicia execução
   ↓
8. PROPONENTE registra MOVIMENTAÇÕES FINANCEIRAS
   ↓
9. Sistema monitora via OPEN BANKING (opcional)
   ↓
10. PROPONENTE envia PRESTAÇÃO DE CONTAS
    ↓
11. PREFEITURA analisa e aprova PRESTAÇÃO
```

## 🎯 Funcionalidades Principais

### **Para Prefeituras:**
- Gestão completa de editais culturais
- Cadastro e gestão de pareceristas
- Acompanhamento de projetos
- Análise de prestações de contas
- Relatórios e dashboards
- Comunicação com proponentes e pareceristas

### **Para Pareceristas:**
- Avaliação de projetos culturais
- Sistema de pontuação por critérios
- Pareceres técnicos detalhados
- Comunicação com proponentes
- Histórico de avaliações

### **Para Proponentes:**
- Cadastro no sistema
- Submissão de projetos
- Acompanhamento do status
- Envio de prestações de contas
- Comunicação com prefeitura e pareceristas

## 🔄 Multi-Tenant

O sistema é **multi-tenant** baseado em `prefeitura_id`:
- Múltiplas prefeituras podem usar o mesmo banco
- Dados são completamente isolados entre prefeituras
- RLS garante que nenhuma prefeitura veja dados de outra
- Ideal para expansão futura do sistema

## 📈 Recursos Avançados

### **Open Banking**
- Monitoramento automático de contas bancárias
- Validação de movimentações financeiras
- Alertas de irregularidades
- Relatórios de conformidade

### **Sistema de Comunicação**
- Comunicação entre todos os tipos de usuários
- Anexos em comunicações
- Sistema de prioridades
- Histórico completo de conversas

### **Prestação de Contas**
- Relatórios de atividades
- Relatórios financeiros
- Comprovantes de gastos
- Análise de conformidade

## 🛠️ Tecnologias Utilizadas

### **Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (componentes)
- React Router DOM (roteamento)
- React Hook Form (formulários)
- Lucide React (ícones)

### **Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Edge Functions (Deno)
- Row Level Security (RLS)
- bcrypt (criptografia)
- JWT (tokens customizados)

### **Ferramentas:**
- ESLint (linting)
- Prettier (formatação)
- TypeScript (tipagem)
- Git (controle de versão)

## 📝 Próximos Passos

1. **Aplicar migrações no banco de dados**
2. **Fazer deploy das Edge Functions**
3. **Atualizar tipos TypeScript**
4. **Implementar hooks de autenticação**
5. **Testar fluxo completo**
6. **Implementar testes automatizados**
7. **Configurar CI/CD**
8. **Documentar APIs**

## 🎭 Conclusão

O Portal Cultural Jaú é uma solução completa para gestão de editais culturais, oferecendo:

- **Segurança robusta** com RLS e criptografia
- **Interface moderna** e responsiva
- **Fluxo completo** desde submissão até prestação de contas
- **Multi-tenant** para expansão futura
- **Open Banking** para monitoramento financeiro
- **Sistema de comunicação** integrado
- **Relatórios e dashboards** para gestão

O sistema está pronto para ser implantado e pode ser facilmente adaptado para outras prefeituras, tornando-se uma solução escalável para gestão cultural no Brasil.
