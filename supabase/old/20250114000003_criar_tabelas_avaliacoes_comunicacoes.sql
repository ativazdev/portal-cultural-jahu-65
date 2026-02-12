-- ============================================
-- TABELAS DE AVALIAÇÕES
-- ============================================

-- Avaliações
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  parecerista_id UUID NOT NULL REFERENCES pareceristas(id),
  
  -- Critérios de avaliação (0-10)
  nota_relevancia DECIMAL(3,1),
  nota_viabilidade DECIMAL(3,1),
  nota_impacto DECIMAL(3,1),
  nota_orcamento DECIMAL(3,1),
  nota_inovacao DECIMAL(3,1),
  nota_sustentabilidade DECIMAL(3,1),
  nota_final DECIMAL(4,2),
  
  -- Parecer
  parecer_tecnico TEXT,
  recomendacao TEXT, -- aprovacao, rejeicao
  
  -- Controle
  status TEXT DEFAULT 'em_analise', -- em_analise, concluido
  data_avaliacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_avaliacao UNIQUE(projeto_id, parecerista_id)
);

-- Índices para avaliações
CREATE INDEX idx_avaliacoes_prefeitura ON avaliacoes(prefeitura_id);
CREATE INDEX idx_avaliacoes_projeto_id ON avaliacoes(projeto_id);
CREATE INDEX idx_avaliacoes_parecerista_id ON avaliacoes(parecerista_id);

-- ============================================
-- TABELAS DE COMUNICAÇÕES
-- ============================================

-- Comunicações
CREATE TABLE comunicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  
  -- Remetente pode ser proponente ou parecerista (tabelas customizadas)
  remetente_tipo TEXT NOT NULL, -- 'proponente', 'parecerista', 'prefeitura'
  remetente_id UUID NOT NULL, -- ID na tabela correspondente
  
  -- Destinatário (normalmente a prefeitura)
  destinatario_tipo TEXT, -- 'proponente', 'parecerista', 'prefeitura'
  destinatario_id UUID, -- ID na tabela correspondente
  
  projeto_id UUID REFERENCES projetos(id),
  
  tipo tipo_comunicacao NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status status_comunicacao DEFAULT 'enviado',
  prioridade TEXT DEFAULT 'normal', -- baixa, normal, alta
  
  -- Resposta
  resposta TEXT,
  respondido_por_tipo TEXT, -- 'prefeitura', 'proponente', 'parecerista'
  respondido_por_id UUID,
  data_resposta TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Anexos de comunicações
CREATE TABLE anexos_comunicacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicacao_id UUID NOT NULL REFERENCES comunicacoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tamanho BIGINT,
  tipo_mime TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para comunicações
CREATE INDEX idx_comunicacoes_prefeitura ON comunicacoes(prefeitura_id);
CREATE INDEX idx_comunicacoes_remetente ON comunicacoes(remetente_tipo, remetente_id);
CREATE INDEX idx_comunicacoes_destinatario ON comunicacoes(destinatario_tipo, destinatario_id);
CREATE INDEX idx_comunicacoes_projeto ON comunicacoes(projeto_id);
CREATE INDEX idx_comunicacoes_status ON comunicacoes(status);
CREATE INDEX idx_anexos_comunicacao ON anexos_comunicacao(comunicacao_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comunicacoes_updated_at
BEFORE UPDATE ON comunicacoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

