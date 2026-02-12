-- Adicionar campos de status de habilitação e tipo de concorrência nos projetos

-- Adicionar campo status_habilitacao
ALTER TABLE projetos 
ADD COLUMN IF NOT EXISTS status_habilitacao TEXT DEFAULT 'pendente' 
CHECK (status_habilitacao IN ('habilitado', 'nao_habilitado', 'pendente'));

-- Adicionar campo tipo_concorrencia
ALTER TABLE projetos 
ADD COLUMN IF NOT EXISTS tipo_concorrencia TEXT 
CHECK (tipo_concorrencia IN ('ampla_concorrencia', 'cotistas'));

-- Função para atualizar tipo_concorrencia baseado em proponente.concorre_cotas
CREATE OR REPLACE FUNCTION atualizar_tipo_concorrencia()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o projeto já tem tipo_concorrencia definido, não sobrescrever
  IF NEW.tipo_concorrencia IS NULL THEN
    -- Buscar informação do proponente
    SELECT 
      CASE 
        WHEN p.concorre_cotas = true THEN 'cotistas'::TEXT
        ELSE 'ampla_concorrencia'::TEXT
      END
    INTO NEW.tipo_concorrencia
    FROM proponentes p
    WHERE p.id = NEW.proponente_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar tipo_concorrencia ao inserir ou atualizar projeto
DROP TRIGGER IF EXISTS trigger_atualizar_tipo_concorrencia ON projetos;
CREATE TRIGGER trigger_atualizar_tipo_concorrencia
  BEFORE INSERT OR UPDATE ON projetos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_tipo_concorrencia();

-- Atualizar projetos existentes com tipo_concorrencia baseado em proponente
UPDATE projetos p
SET tipo_concorrencia = 
  CASE 
    WHEN pr.concorre_cotas = true THEN 'cotistas'
    ELSE 'ampla_concorrencia'
  END
FROM proponentes pr
WHERE p.proponente_id = pr.id
  AND p.tipo_concorrencia IS NULL;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_projetos_status_habilitacao ON projetos(status_habilitacao);
CREATE INDEX IF NOT EXISTS idx_projetos_tipo_concorrencia ON projetos(tipo_concorrencia);

-- Comentários
COMMENT ON COLUMN projetos.status_habilitacao IS 'Status de habilitação do projeto: habilitado, nao_habilitado, pendente';
COMMENT ON COLUMN projetos.tipo_concorrencia IS 'Tipo de concorrência: ampla_concorrencia ou cotistas, baseado em proponente.concorre_cotas';

