-- Criar tabela de recursos e contrarrazão

CREATE TABLE IF NOT EXISTS recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  proponente_id UUID NOT NULL REFERENCES proponentes(id) ON DELETE CASCADE,
  
  -- Tipo de recurso
  tipo TEXT NOT NULL CHECK (tipo IN ('recurso', 'contra_razao')),
  
  -- Justificativa do recurso
  justificativa TEXT NOT NULL,
  
  -- Status do recurso
  status TEXT NOT NULL DEFAULT 'pendente' 
    CHECK (status IN ('pendente', 'em_analise', 'deferido', 'indeferido')),
  
  -- Resposta da prefeitura
  resposta TEXT,
  respondido_por UUID REFERENCES profiles(id),
  data_resposta TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhorar performance
CREATE INDEX idx_recursos_prefeitura ON recursos(prefeitura_id);
CREATE INDEX idx_recursos_projeto ON recursos(projeto_id);
CREATE INDEX idx_recursos_proponente ON recursos(proponente_id);
CREATE INDEX idx_recursos_status ON recursos(status);
CREATE INDEX idx_recursos_tipo ON recursos(tipo);

-- Trigger para updated_at
CREATE TRIGGER update_recursos_updated_at
BEFORE UPDATE ON recursos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE recursos IS 'Tabela para recursos e contra-razões de projetos avaliados';
COMMENT ON COLUMN recursos.tipo IS 'Tipo: recurso ou contra_razao';
COMMENT ON COLUMN recursos.status IS 'Status: pendente, em_analise, deferido, indeferido';

-- RLS (Row Level Security)
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

-- Política: proponentes podem ver seus próprios recursos
CREATE POLICY "Proponentes podem ver seus recursos"
  ON recursos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proponentes p
      WHERE p.id = recursos.proponente_id
      AND p.id = (SELECT current_setting('app.current_proponente_id', true)::UUID)
    )
  );

-- Política: prefeitura pode ver todos os recursos de sua prefeitura
CREATE POLICY "Prefeitura pode ver seus recursos"
  ON recursos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
      AND pr.prefeitura_id = recursos.prefeitura_id
    )
  );

-- Política: proponentes podem criar recursos para seus projetos
CREATE POLICY "Proponentes podem criar recursos"
  ON recursos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proponentes p
      WHERE p.id = recursos.proponente_id
      AND p.id = (SELECT current_setting('app.current_proponente_id', true)::UUID)
    )
  );

-- Política: prefeitura pode atualizar recursos (responder)
CREATE POLICY "Prefeitura pode atualizar recursos"
  ON recursos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.id = auth.uid()
      AND pr.prefeitura_id = recursos.prefeitura_id
    )
  );

