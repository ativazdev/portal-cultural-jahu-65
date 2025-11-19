-- Atualizar enum status_edital para incluir novos status
-- Adicionar novos valores mantendo compatibilidade com valores antigos

-- Como não podemos remover valores de um enum diretamente, vamos criar um novo enum
-- e migrar os dados

-- 1. Criar novo enum com todos os valores
DO $$ BEGIN
  CREATE TYPE status_edital_new AS ENUM (
    'recebendo_projetos',
    'avaliacao',
    'recurso',
    'contra_razao',
    'em_execucao',
    'finalizado',
    'ativo',
    'arquivado',
    'rascunho'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar coluna temporária com novo enum
ALTER TABLE editais ADD COLUMN status_new status_edital_new;

-- 3. Migrar dados existentes (mapear valores antigos para novos)
UPDATE editais SET status_new = 
  CASE 
    WHEN status::text = 'ativo' THEN 'recebendo_projetos'::status_edital_new
    WHEN status::text = 'arquivado' THEN 'finalizado'::status_edital_new
    WHEN status::text = 'rascunho' THEN 'rascunho'::status_edital_new
    ELSE 'rascunho'::status_edital_new
  END;

-- 4. Tornar coluna não nula e definir default
ALTER TABLE editais ALTER COLUMN status_new SET NOT NULL;
ALTER TABLE editais ALTER COLUMN status_new SET DEFAULT 'rascunho'::status_edital_new;

-- 5. Remover coluna antiga
ALTER TABLE editais DROP COLUMN status;

-- 6. Renomear coluna nova
ALTER TABLE editais RENAME COLUMN status_new TO status;

-- 7. Remover tipo antigo e renomear novo
DROP TYPE IF EXISTS status_edital;
ALTER TYPE status_edital_new RENAME TO status_edital;

-- Comentário explicativo
COMMENT ON TYPE status_edital IS 'Status do edital no sistema. Valores: recebendo_projetos, avaliacao, recurso, contra_razao, em_execucao, finalizado, ativo (legacy), arquivado (legacy), rascunho';

