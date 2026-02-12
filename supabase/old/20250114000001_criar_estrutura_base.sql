-- ============================================
-- EXTENSÕES NECESSÁRIAS
-- ============================================

-- Extensão para criptografia de senhas (bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- ENUMS
-- ============================================

-- Status do edital
CREATE TYPE status_edital AS ENUM ('ativo', 'arquivado', 'rascunho');

-- Tipo de proponente
CREATE TYPE tipo_proponente AS ENUM ('PF', 'PJ', 'Grupo', 'COOP');

-- Status do projeto
CREATE TYPE status_projeto AS ENUM (
  'recebido', 
  'em_avaliacao', 
  'avaliado', 
  'aprovado', 
  'rejeitado', 
  'em_execucao',
  'concluido'
);

-- Status de documentos
CREATE TYPE status_documento AS ENUM ('pendente', 'enviado', 'aprovado', 'rejeitado');

-- Status de prestação de contas
CREATE TYPE status_prestacao AS ENUM (
  'pendente', 
  'em_analise', 
  'aprovado', 
  'rejeitado',
  'exigencia'
);

-- Status Open Banking
CREATE TYPE status_open_banking AS ENUM ('conforme', 'alerta', 'irregularidade', 'nao_monitorado');

-- Tipo de comunicação
CREATE TYPE tipo_comunicacao AS ENUM ('recurso', 'duvida', 'solicitacao', 'notificacao');

-- Status de comunicação
CREATE TYPE status_comunicacao AS ENUM ('enviado', 'lido', 'em_analise', 'respondido');

-- modalidades culturais
CREATE TYPE Categoria_cultural AS ENUM (
  'musica',
  'teatro',
  'danca',
  'artes_visuais',
  'literatura',
  'cinema',
  'cultura_popular',
  'circo',
  'outros'
);

-- Papel do usuário da prefeitura
CREATE TYPE papel_usuario AS ENUM ('gestor', 'assistente', 'financeiro', 'administrador');

-- ============================================
-- TABELA DE PREFEITURAS
-- ============================================

CREATE TABLE prefeituras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  cep TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir a prefeitura de Jahu como padrão
INSERT INTO prefeituras (nome, municipio, estado, cnpj, email, telefone)
VALUES (
  'Prefeitura Municipal de Jaú',
  'Jaú',
  'SP',
  '46.194.846/0001-01',
  'cultura@jau.sp.gov.br',
  '(14) 3602-1234'
);

-- ============================================
-- TABELA DE USUÁRIOS DA PREFEITURA
-- ============================================

-- Atualizar a tabela profiles existente para adicionar prefeitura_id
ALTER TABLE profiles ADD COLUMN prefeitura_id UUID REFERENCES prefeituras(id);
ALTER TABLE profiles ADD COLUMN papel papel_usuario;
ALTER TABLE profiles ADD COLUMN ativo BOOLEAN DEFAULT true;

-- ============================================
-- TABELA DE PARECERISTAS
-- ============================================

CREATE TABLE pareceristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  
  -- Dados de autenticação
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL, -- senha criptografada com crypt()
  
  -- Dados pessoais
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  rg TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  data_nascimento DATE,
  
  -- Dados profissionais
  area_atuacao TEXT,
  especialidade Categoria_cultural[],
  experiencia_anos INTEGER,
  formacao_academica TEXT,
  mini_curriculo TEXT,
  
  -- Controle
  status TEXT DEFAULT 'ativo', -- ativo, inativo, bloqueado
  projetos_em_analise INTEGER DEFAULT 0,
  total_avaliacoes INTEGER DEFAULT 0,
  data_ativacao DATE DEFAULT CURRENT_DATE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para pareceristas
CREATE INDEX idx_pareceristas_prefeitura ON pareceristas(prefeitura_id);
CREATE INDEX idx_pareceristas_email ON pareceristas(email);
CREATE INDEX idx_pareceristas_cpf ON pareceristas(cpf);
CREATE INDEX idx_pareceristas_status ON pareceristas(status);
CREATE INDEX idx_pareceristas_especialidade ON pareceristas USING GIN(especialidade);

-- ============================================
-- TABELA DE PROPONENTES
-- ============================================

CREATE TABLE proponentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  
  -- Dados de autenticação
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL, -- senha criptografada com crypt()
  
  -- Tipo de proponente
  tipo tipo_proponente NOT NULL,
  
  -- Dados comuns
  nome TEXT NOT NULL,
  nome_artistico TEXT,
  telefone TEXT,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  
  -- Dados PF específicos
  cpf TEXT,
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
  
  -- Dados PJ
  cnpj TEXT,
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
  status TEXT DEFAULT 'ativo', -- ativo, inativo, bloqueado
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints para garantir que CPF ou CNPJ seja único por tipo
  CONSTRAINT cpf_required_for_pf CHECK (tipo != 'PF' OR cpf IS NOT NULL),
  CONSTRAINT cnpj_required_for_pj CHECK (tipo != 'PJ' OR cnpj IS NOT NULL)
);

-- Índices para proponentes
CREATE INDEX idx_proponentes_prefeitura ON proponentes(prefeitura_id);
CREATE INDEX idx_proponentes_email ON proponentes(email);
CREATE INDEX idx_proponentes_cpf ON proponentes(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_proponentes_cnpj ON proponentes(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_proponentes_tipo ON proponentes(tipo);
CREATE INDEX idx_proponentes_status ON proponentes(status);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_prefeituras_updated_at
BEFORE UPDATE ON prefeituras
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pareceristas_updated_at
BEFORE UPDATE ON pareceristas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proponentes_updated_at
BEFORE UPDATE ON proponentes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

