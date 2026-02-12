-- ============================================
-- TABELA DE ATIVIDADES DO CRONOGRAMA
-- ============================================

-- Criar tabela para atividades do cronograma de execução
CREATE TABLE atividades_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  
  -- Dados da atividade
  nome_atividade TEXT NOT NULL,
  etapa TEXT NOT NULL, -- 'Pré-produção', 'Produção', 'Pós-produção', 'Divulgação'
  descricao TEXT NOT NULL,
  
  -- Datas
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  
  -- Controle
  ordem INTEGER DEFAULT 0, -- Para manter ordem das atividades
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Validações
  CONSTRAINT data_fim_posterior_inicio CHECK (data_fim >= data_inicio)
);

-- Índices
CREATE INDEX idx_atividades_projeto_projeto_id ON atividades_projeto(projeto_id);
CREATE INDEX idx_atividades_projeto_ordem ON atividades_projeto(projeto_id, ordem);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_atualizar_updated_at_atividades()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atividades_projeto_updated_at
  BEFORE UPDATE ON atividades_projeto
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_updated_at_atividades();

-- Comentários
COMMENT ON TABLE atividades_projeto IS 'Atividades do cronograma de execução dos projetos';
COMMENT ON COLUMN atividades_projeto.etapa IS 'Etapa do projeto: Pré-produção, Produção, Pós-produção, Divulgação';
COMMENT ON COLUMN atividades_projeto.ordem IS 'Ordem de exibição das atividades no cronograma';
