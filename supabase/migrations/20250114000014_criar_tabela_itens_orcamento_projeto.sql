-- Criar tabela para itens de orçamento do projeto
CREATE TABLE itens_orcamento_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  justificativa TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  referencia_preco TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_itens_orcamento_projeto_id ON itens_orcamento_projeto(projeto_id);
CREATE INDEX idx_itens_orcamento_projeto_ordem ON itens_orcamento_projeto(projeto_id, ordem);

-- RLS (Row Level Security)
ALTER TABLE itens_orcamento_projeto ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso baseado no projeto
CREATE POLICY "Users can view itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = itens_orcamento_projeto.projeto_id 
      AND e.prefeitura_id = auth.jwt() ->> 'prefeitura_id'
    )
  );

CREATE POLICY "Users can insert itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = projeto_id 
      AND e.prefeitura_id = auth.jwt() ->> 'prefeitura_id'
    )
  );

CREATE POLICY "Users can update itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = projeto_id 
      AND e.prefeitura_id = auth.jwt() ->> 'prefeitura_id'
    )
  );

CREATE POLICY "Users can delete itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = projeto_id 
      AND e.prefeitura_id = auth.jwt() ->> 'prefeitura_id'
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_itens_orcamento_projeto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_itens_orcamento_projeto_updated_at
  BEFORE UPDATE ON itens_orcamento_projeto
  FOR EACH ROW
  EXECUTE FUNCTION update_itens_orcamento_projeto_updated_at();

-- Adicionar coluna valor_maximo_projeto na tabela projetos
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS valor_maximo_projeto DECIMAL(10,2) CHECK (valor_maximo_projeto >= 0);

-- Comentários
COMMENT ON TABLE itens_orcamento_projeto IS 'Itens de orçamento detalhados para cada projeto';
COMMENT ON COLUMN itens_orcamento_projeto.projeto_id IS 'ID do projeto ao qual o item pertence';
COMMENT ON COLUMN itens_orcamento_projeto.descricao IS 'Descrição do item de despesa';
COMMENT ON COLUMN itens_orcamento_projeto.justificativa IS 'Justificativa para o item';
COMMENT ON COLUMN itens_orcamento_projeto.unidade_medida IS 'Unidade de medida (Serviço, Hora, Diária, etc.)';
COMMENT ON COLUMN itens_orcamento_projeto.valor_unitario IS 'Valor unitário do item';
COMMENT ON COLUMN itens_orcamento_projeto.quantidade IS 'Quantidade do item';
COMMENT ON COLUMN itens_orcamento_projeto.referencia_preco IS 'Referência para o preço (cotação, etc.)';
COMMENT ON COLUMN itens_orcamento_projeto.ordem IS 'Ordem de exibição do item';
COMMENT ON COLUMN projetos.valor_maximo_projeto IS 'Valor máximo permitido para o projeto (pode ser diferente do edital)';
