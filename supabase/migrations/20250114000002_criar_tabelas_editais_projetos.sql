-- ============================================
-- TABELAS DE EDITAIS
-- ============================================

-- Editais
CREATE TABLE editais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  data_abertura DATE NOT NULL,
  data_final_envio_projeto DATE NOT NULL,
  horario_final_envio_projeto TIME NOT NULL,
  status status_edital NOT NULL DEFAULT 'ativo',
  total_projetos INTEGER DEFAULT 0,
  valor_maximo DECIMAL(12,2),
  prazo_avaliacao INTEGER, -- dias
  modalidades modalidade_cultural[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Código do edital deve ser único por prefeitura
  CONSTRAINT unique_edital_codigo_prefeitura UNIQUE(prefeitura_id, codigo)
);

-- Arquivos do edital
CREATE TABLE arquivos_edital (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id UUID NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tamanho BIGINT,
  tipo_mime TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para editais
CREATE INDEX idx_editais_prefeitura ON editais(prefeitura_id);
CREATE INDEX idx_editais_status ON editais(status);
CREATE INDEX idx_editais_codigo ON editais(codigo);
CREATE INDEX idx_arquivos_edital ON arquivos_edital(edital_id);

-- ============================================
-- TABELAS DE PROJETOS
-- ============================================

-- Projetos
CREATE TABLE projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  edital_id UUID NOT NULL REFERENCES editais(id),
  proponente_id UUID NOT NULL REFERENCES proponentes(id),
  parecerista_id UUID REFERENCES pareceristas(id),
  
  nome TEXT NOT NULL,
  modalidade modalidade_cultural NOT NULL,
  categoria TEXT,
  descricao TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  perfil_publico TEXT,
  publico_prioritario TEXT[],
  outro_publico_prioritario TEXT,
  
  -- Acessibilidade
  acessibilidade_arquitetonica TEXT[],
  outra_acessibilidade_arquitetonica TEXT,
  acessibilidade_comunicacional TEXT[],
  outra_acessibilidade_comunicacional TEXT,
  acessibilidade_atitudinal TEXT[],
  implementacao_acessibilidade TEXT,
  
  -- Execução
  local_execucao TEXT,
  data_inicio DATE,
  data_final DATE,
  estrategia_divulgacao TEXT,
  
  -- Financeiro
  valor_solicitado DECIMAL(12,2) NOT NULL,
  outras_fontes BOOLEAN DEFAULT false,
  tipos_outras_fontes TEXT[],
  detalhes_outras_fontes TEXT,
  venda_produtos BOOLEAN DEFAULT false,
  detalhes_venda_produtos TEXT,
  
  -- Status e controle
  status status_projeto NOT NULL DEFAULT 'recebido',
  data_submissao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  necessita_comprovante_residencia BOOLEAN DEFAULT false,
  numero_inscricao TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Número de inscrição único por edital
  CONSTRAINT unique_numero_inscricao_edital UNIQUE(edital_id, numero_inscricao)
);

-- Metas do projeto
CREATE TABLE metas_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Equipe do projeto
CREATE TABLE equipe_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL,
  cpf_cnpj TEXT,
  indigena BOOLEAN DEFAULT false,
  lgbtqiapn BOOLEAN DEFAULT false,
  preto_pardo BOOLEAN DEFAULT false,
  deficiencia BOOLEAN DEFAULT false,
  mini_curriculo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Documentos de habilitação
CREATE TABLE documentos_habilitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT, -- rg, cpf, cnpj, certidoes, etc
  obrigatorio BOOLEAN DEFAULT false,
  status status_documento DEFAULT 'pendente',
  arquivo_nome TEXT,
  arquivo_url TEXT,
  arquivo_tamanho BIGINT,
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_upload TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Planilha orçamentária
CREATE TABLE planilha_orcamentaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  
  categoria TEXT NOT NULL, -- recursos_humanos, servicos, material, divulgacao, etc
  item TEXT NOT NULL,
  descricao TEXT,
  quantidade INTEGER,
  valor_unitario DECIMAL(12,2),
  valor_total DECIMAL(12,2),
  justificativa TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para projetos
CREATE INDEX idx_projetos_prefeitura ON projetos(prefeitura_id);
CREATE INDEX idx_projetos_edital_id ON projetos(edital_id);
CREATE INDEX idx_projetos_proponente_id ON projetos(proponente_id);
CREATE INDEX idx_projetos_parecerista_id ON projetos(parecerista_id);
CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_metas_projeto ON metas_projeto(projeto_id);
CREATE INDEX idx_equipe_projeto ON equipe_projeto(projeto_id);
CREATE INDEX idx_documentos_projeto ON documentos_habilitacao(projeto_id);
CREATE INDEX idx_planilha_projeto ON planilha_orcamentaria(projeto_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_editais_updated_at
BEFORE UPDATE ON editais
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
BEFORE UPDATE ON projetos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at
BEFORE UPDATE ON documentos_habilitacao
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planilha_updated_at
BEFORE UPDATE ON planilha_orcamentaria
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

