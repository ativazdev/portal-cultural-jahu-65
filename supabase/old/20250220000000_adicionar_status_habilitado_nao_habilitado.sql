-- Adicionar novos valores 'habilitado' e 'nao_habilitado' ao enum status_projeto

-- Adicionar 'habilitado' ao enum
DO $$ BEGIN
  ALTER TYPE status_projeto ADD VALUE IF NOT EXISTS 'habilitado' AFTER 'avaliado';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adicionar 'nao_habilitado' ao enum
DO $$ BEGIN
  ALTER TYPE status_projeto ADD VALUE IF NOT EXISTS 'nao_habilitado' AFTER 'habilitado';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Comentário explicativo
COMMENT ON TYPE status_projeto IS 'Status dos projetos no sistema. Valores: recebido, aguardando_avaliacao, em_avaliacao, avaliado, habilitado, nao_habilitado, aprovado, rejeitado, em_execucao, concluido';

