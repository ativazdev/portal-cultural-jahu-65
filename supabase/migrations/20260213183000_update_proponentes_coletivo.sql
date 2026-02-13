-- Migration: Adicionar tipo COLETIVO ao cadastro de proponentes e expandir campos
-- Created: 2026-02-13

-- 1. Atualizar o enum/constraint de tipo para proponentes
ALTER TABLE proponentes 
  DROP CONSTRAINT IF EXISTS proponentes_tipo_check;

ALTER TABLE proponentes 
  ADD CONSTRAINT proponentes_tipo_check 
  CHECK (tipo IN ('PF', 'PJ', 'COLETIVO'));

-- 2. Adicionar campos específicos para COLETIVO se não existirem
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS nome_grupo TEXT,
  ADD COLUMN IF NOT EXISTS quantidade_pessoas INTEGER,
  ADD COLUMN IF NOT EXISTS ano_criacao INTEGER,
  ADD COLUMN IF NOT EXISTS membros_coletivo TEXT;

-- 3. Garantir que campos sociodemográficos existam (alguns podem já existir para PF/PJ)
-- Nota: A tabela já parece ter muitos desses campos, vamos apenas garantir os tipos
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS outra_comunidade TEXT,
  ADD COLUMN IF NOT EXISTS outra_deficiencia TEXT,
  ADD COLUMN IF NOT EXISTS outro_programa_social TEXT,
  ADD COLUMN IF NOT EXISTS outra_funcao_artistica TEXT,
  ADD COLUMN IF NOT EXISTS profissao TEXT;

-- 4. Comentários para documentação
COMMENT ON COLUMN proponentes.tipo IS 'Tipo de proponente: PF (Pessoa Física), PJ (Pessoa Jurídica) ou COLETIVO (Grupo sem CNPJ)';
COMMENT ON COLUMN proponentes.nome_grupo IS 'Nome do grupo ou coletivo (tipo COLETIVO)';
COMMENT ON COLUMN proponentes.membros_coletivo IS 'Lista de membros do coletivo ou grupo';
