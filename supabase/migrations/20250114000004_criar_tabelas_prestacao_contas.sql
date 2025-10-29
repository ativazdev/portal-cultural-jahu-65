-- ============================================
-- TABELAS DE PRESTAÇÃO DE CONTAS
-- ============================================

-- Prestações de contas
CREATE TABLE prestacoes_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES projetos(id),
  proponente_id UUID NOT NULL REFERENCES proponentes(id),
  
  tipo TEXT, -- parcial, final
  valor_executado DECIMAL(12,2),
  data_entrega TIMESTAMP WITH TIME ZONE,
  prazo_entrega DATE,
  status status_prestacao DEFAULT 'pendente',
  status_open_banking status_open_banking DEFAULT 'nao_monitorado',
  
  -- Documentos
  relatorio_atividades TEXT,
  relatorio_financeiro TEXT,
  comprovantes_url TEXT,
  
  -- Análise
  parecer_analise TEXT,
  analisado_por UUID REFERENCES auth.users(id),
  data_analise TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Movimentações financeiras (Open Banking)
CREATE TABLE movimentacoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES projetos(id),
  prestacao_id UUID REFERENCES prestacoes_contas(id),
  
  tipo TEXT NOT NULL, -- credito, debito
  descricao TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_movimentacao TIMESTAMP WITH TIME ZONE NOT NULL,
  origem_destino TEXT, -- banco/beneficiário
  metodo_pagamento TEXT, -- pix, ted, doc, boleto
  documento_fiscal TEXT,
  categoria_despesa TEXT,
  
  -- Validação
  status_validacao TEXT DEFAULT 'pendente', -- pendente, aprovado, rejeitado
  observacao TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contas bancárias monitoradas (Open Banking)
CREATE TABLE contas_monitoradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES projetos(id),
  proponente_id UUID NOT NULL REFERENCES proponentes(id),
  
  banco TEXT NOT NULL,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT, -- corrente, poupança
  
  -- Integração Open Banking
  consentimento_id TEXT, -- ID do consentimento Open Banking
  consentimento_ativo BOOLEAN DEFAULT false,
  data_consentimento TIMESTAMP WITH TIME ZONE,
  data_expiracao_consentimento TIMESTAMP WITH TIME ZONE,
  
  -- Saldos
  saldo_atual DECIMAL(12,2),
  valor_total_recebido DECIMAL(12,2) DEFAULT 0,
  valor_total_gasto DECIMAL(12,2) DEFAULT 0,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'ativa', -- ativa, encerrada, suspensa
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para prestações
CREATE INDEX idx_prestacoes_prefeitura ON prestacoes_contas(prefeitura_id);
CREATE INDEX idx_prestacoes_projeto_id ON prestacoes_contas(projeto_id);
CREATE INDEX idx_prestacoes_proponente_id ON prestacoes_contas(proponente_id);
CREATE INDEX idx_prestacoes_status ON prestacoes_contas(status);

CREATE INDEX idx_movimentacoes_prefeitura ON movimentacoes_financeiras(prefeitura_id);
CREATE INDEX idx_movimentacoes_projeto_id ON movimentacoes_financeiras(projeto_id);
CREATE INDEX idx_movimentacoes_prestacao_id ON movimentacoes_financeiras(prestacao_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_financeiras(data_movimentacao);

CREATE INDEX idx_contas_prefeitura ON contas_monitoradas(prefeitura_id);
CREATE INDEX idx_contas_projeto ON contas_monitoradas(projeto_id);
CREATE INDEX idx_contas_proponente ON contas_monitoradas(proponente_id);
CREATE INDEX idx_contas_status ON contas_monitoradas(status);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_prestacoes_updated_at
BEFORE UPDATE ON prestacoes_contas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_updated_at
BEFORE UPDATE ON contas_monitoradas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

