-- ============================================
-- TABELA DE CONTATO/SUPORTE
-- ============================================

-- Criar tabela para armazenar dados de contato do suporte
-- Contato único para todas as prefeituras
CREATE TABLE IF NOT EXISTS contato_suporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  whatsapp TEXT,
  email TEXT,
  telefone TEXT,
  observacoes TEXT,
  
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_contato_suporte_ativo ON contato_suporte(ativo);

-- Habilitar RLS
ALTER TABLE contato_suporte ENABLE ROW LEVEL SECURITY;

-- Política RLS: Permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler contato de suporte"
  ON contato_suporte
  FOR SELECT
  TO authenticated
  USING (true);

-- Política RLS: Permitir inserção/atualização apenas para usuários autenticados
-- (pode ser ajustada para restringir apenas a administradores se necessário)
CREATE POLICY "Usuários autenticados podem gerenciar contato de suporte"
  ON contato_suporte
  FOR ALL
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION atualizar_updated_at_contato_suporte()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_updated_at_contato_suporte
  BEFORE UPDATE ON contato_suporte
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at_contato_suporte();

-- Inserir dados iniciais (exemplo - pode ser removido depois)
-- INSERT INTO contato_suporte (whatsapp, email, telefone, observacoes)
-- VALUES (
--   '(14) 99999-9999',
--   'suporte@prefeitura.gov.br',
--   '(14) 3621-0000',
--   'Horário de atendimento: Segunda a Sexta, das 8h às 17h'
-- );

