-- Migration: Project Qualification and Approval
-- Descrição: Adiciona novos status para projetos e coluna de motivo de rejeição

-- Adicionar novos valores ao enum status_projeto se existirem
DO $$ BEGIN
    ALTER TYPE status_projeto ADD VALUE IF NOT EXISTS 'habilitado';
    ALTER TYPE status_projeto ADD VALUE IF NOT EXISTS 'nao_habilitado';
    ALTER TYPE status_projeto ADD VALUE IF NOT EXISTS 'suplente';
    ALTER TYPE status_projeto ADD VALUE IF NOT EXISTS 'desclassificado';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna motivo_rejeicao em projetos se não existir
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;

-- Comentário explicativo
COMMENT ON COLUMN projetos.motivo_rejeicao IS 'Motivo da inabilitação, desclassificação ou rejeição do projeto';
