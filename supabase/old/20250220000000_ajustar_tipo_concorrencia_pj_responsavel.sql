-- ============================================
-- AJUSTAR TIPO DE CONCORRÊNCIA PARA PJ COM RESPONSÁVEL LEGAL COTISTA
-- ============================================
-- Esta migration atualiza a função que determina o tipo_concorrencia dos projetos
-- para considerar que se o proponente é PJ e o responsável legal é cotista,
-- o projeto também deve ser classificado como cotista.

-- Atualizar função para considerar responsável legal em PJ
CREATE OR REPLACE FUNCTION atualizar_tipo_concorrencia()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o projeto já tem tipo_concorrencia definido manualmente, não sobrescrever
  IF NEW.tipo_concorrencia IS NULL THEN
    -- Buscar informação do proponente
    SELECT 
      CASE 
        -- Se for Pessoa Física (PF), usar concorre_cotas do próprio proponente
        WHEN p.tipo = 'PF' THEN
          CASE 
            WHEN p.concorre_cotas = true THEN 'cotistas'::TEXT
            ELSE 'ampla_concorrencia'::TEXT
          END
        -- Se for Pessoa Jurídica (PJ), usar concorre_cotas_responsavel do responsável legal
        WHEN p.tipo = 'PJ' THEN
          CASE 
            WHEN COALESCE(p.concorre_cotas_responsavel, false) = true THEN 'cotistas'::TEXT
            ELSE 'ampla_concorrencia'::TEXT
          END
        -- Para outros tipos (Grupo, COOP), usar concorre_cotas do próprio proponente
        ELSE
          CASE 
            WHEN p.concorre_cotas = true THEN 'cotistas'::TEXT
            ELSE 'ampla_concorrencia'::TEXT
          END
      END
    INTO NEW.tipo_concorrencia
    FROM proponentes p
    WHERE p.id = NEW.proponente_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Atualizar projetos existentes com tipo_concorrencia baseado na nova lógica
UPDATE projetos p
SET tipo_concorrencia = 
  CASE 
    -- Se for Pessoa Física (PF), usar concorre_cotas do próprio proponente
    WHEN pr.tipo = 'PF' THEN
      CASE 
        WHEN pr.concorre_cotas = true THEN 'cotistas'
        ELSE 'ampla_concorrencia'
      END
    -- Se for Pessoa Jurídica (PJ), usar concorre_cotas_responsavel do responsável legal
    WHEN pr.tipo = 'PJ' THEN
      CASE 
        WHEN COALESCE(pr.concorre_cotas_responsavel, false) = true THEN 'cotistas'
        ELSE 'ampla_concorrencia'
      END
    -- Para outros tipos (Grupo, COOP), usar concorre_cotas do próprio proponente
    ELSE
      CASE 
        WHEN pr.concorre_cotas = true THEN 'cotistas'
        ELSE 'ampla_concorrencia'
      END
  END
FROM proponentes pr
WHERE p.proponente_id = pr.id
  AND p.tipo_concorrencia IS NULL;

-- Atualizar comentário da coluna
COMMENT ON COLUMN projetos.tipo_concorrencia IS 'Tipo de concorrência: ampla_concorrencia ou cotistas. Para PF/Grupo/COOP: baseado em proponente.concorre_cotas. Para PJ: baseado em proponente.concorre_cotas_responsavel.';

