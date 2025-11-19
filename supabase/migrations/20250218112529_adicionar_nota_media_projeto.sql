-- Adicionar campo nota_media no projeto e função para calcular média automaticamente

-- Adicionar campo nota_media
ALTER TABLE projetos 
ADD COLUMN IF NOT EXISTS nota_media DECIMAL(4,2);

-- Função para calcular média das avaliações concluídas de um projeto
CREATE OR REPLACE FUNCTION calcular_nota_media_projeto(projeto_uuid UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
  media_calculada DECIMAL(4,2);
  total_avaliacoes INTEGER;
  avaliacoes_concluidas INTEGER;
BEGIN
  -- Contar total de avaliações atribuídas
  SELECT COUNT(*) INTO total_avaliacoes
  FROM avaliacoes
  WHERE projeto_id = projeto_uuid;
  
  -- Contar avaliações concluídas (status = 'avaliado')
  SELECT COUNT(*) INTO avaliacoes_concluidas
  FROM avaliacoes
  WHERE projeto_id = projeto_uuid
    AND status = 'avaliado';
  
  -- Se não há avaliações atribuídas, retornar NULL
  IF total_avaliacoes = 0 THEN
    RETURN NULL;
  END IF;
  
  -- Se todas as avaliações foram concluídas, calcular média
  IF avaliacoes_concluidas = total_avaliacoes AND total_avaliacoes > 0 THEN
    SELECT AVG(nota_final) INTO media_calculada
    FROM avaliacoes
    WHERE projeto_id = projeto_uuid
      AND status = 'avaliado'
      AND nota_final IS NOT NULL;
    
    RETURN media_calculada;
  END IF;
  
  -- Se ainda há avaliações pendentes, retornar NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função trigger para atualizar nota_media quando uma avaliação é atualizada
CREATE OR REPLACE FUNCTION trigger_atualizar_nota_media()
RETURNS TRIGGER AS $$
DECLARE
  nova_nota_media DECIMAL(4,2);
BEGIN
  -- Calcular nova média
  nova_nota_media := calcular_nota_media_projeto(NEW.projeto_id);
  
  -- Atualizar nota_media do projeto
  UPDATE projetos
  SET nota_media = nova_nota_media,
      status = CASE 
        WHEN nova_nota_media IS NOT NULL THEN 'avaliado'
        WHEN (SELECT COUNT(*) FROM avaliacoes WHERE projeto_id = NEW.projeto_id AND status IN ('pendente', 'aguardando_parecerista')) > 0 
          THEN 'aguardando_avaliacao'
        ELSE projetos.status
      END
  WHERE id = NEW.projeto_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que executa após inserção ou atualização de avaliação
DROP TRIGGER IF EXISTS trigger_atualizar_nota_media_avaliacao ON avaliacoes;
CREATE TRIGGER trigger_atualizar_nota_media_avaliacao
  AFTER INSERT OR UPDATE OF status, nota_final ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_nota_media();

-- Atualizar projetos existentes que já têm todas as avaliações concluídas
UPDATE projetos p
SET nota_media = calcular_nota_media_projeto(p.id)
WHERE EXISTS (
  SELECT 1 FROM avaliacoes a
  WHERE a.projeto_id = p.id
  GROUP BY a.projeto_id
  HAVING COUNT(*) = COUNT(CASE WHEN a.status = 'avaliado' THEN 1 END)
    AND COUNT(*) > 0
);

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_projetos_nota_media ON projetos(nota_media);

-- Comentários
COMMENT ON COLUMN projetos.nota_media IS 'Nota média calculada automaticamente quando todas as avaliações são concluídas';
COMMENT ON FUNCTION calcular_nota_media_projeto IS 'Calcula a média aritmética das notas finais de todas as avaliações concluídas de um projeto';

