-- Migration: Fix COLETIVO enum and ensure columns exist
-- Created: 2026-02-13

-- 1. Add 'COLETIVO' to tipo_proponente enum
-- Note: 'IF NOT EXISTS' for ADD VALUE requires Postgres 12+
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'tipo_proponente' AND e.enumlabel = 'COLETIVO') THEN
        ALTER TYPE tipo_proponente ADD VALUE 'COLETIVO';
    END IF;
END
$$;

-- 2. Update the check constraint to include COLETIVO
ALTER TABLE proponentes 
  DROP CONSTRAINT IF EXISTS cpf_ou_cnpj_obrigatorio;

ALTER TABLE proponentes
  ADD CONSTRAINT cpf_ou_cnpj_obrigatorio CHECK (
    (tipo = 'PF' AND cpf IS NOT NULL) OR
    (tipo = 'PJ' AND cnpj IS NOT NULL) OR
    (tipo = 'Grupo' AND cpf IS NOT NULL) OR
    (tipo = 'COOP' AND cnpj IS NOT NULL) OR
    (tipo = 'COLETIVO' AND nome_grupo IS NOT NULL)
  );

-- 3. Ensure all required columns for COLETIVO exist in the proponentes table
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS nome_grupo TEXT,
  ADD COLUMN IF NOT EXISTS quantidade_pessoas INTEGER,
  ADD COLUMN IF NOT EXISTS ano_criacao INTEGER,
  ADD COLUMN IF NOT EXISTS membros_coletivo TEXT;

-- 3. Ensure social/demographic columns exist (for all types)
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS outra_comunidade TEXT,
  ADD COLUMN IF NOT EXISTS outra_deficiencia TEXT,
  ADD COLUMN IF NOT EXISTS outro_programa_social TEXT,
  ADD COLUMN IF NOT EXISTS outra_funcao_artistica TEXT,
  ADD COLUMN IF NOT EXISTS profissao TEXT;

-- 4. Add Representative/Responsible columns if they are missing
-- (Looking at the form data, these are also used)
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS nome_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS cpf_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS rg_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS data_nascimento_responsavel DATE,
  ADD COLUMN IF NOT EXISTS telefone_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS email_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS cep_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS endereco_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS numero_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS complemento_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS cidade_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS estado_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS comunidade_tradicional_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outra_comunidade_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS genero_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS raca_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS pcd_responsavel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_deficiencia_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outra_deficiencia_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS escolaridade_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS renda_mensal_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS programa_social_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outro_programa_social_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS concorre_cotas_responsavel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_cotas_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS funcao_artistica_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outra_funcao_artistica_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS profissao_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS mini_curriculo_responsavel TEXT;

-- 5. Add Banking Info columns if missing
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS banco TEXT,
  ADD COLUMN IF NOT EXISTS agencia TEXT,
  ADD COLUMN IF NOT EXISTS conta TEXT,
  ADD COLUMN IF NOT EXISTS tipo_conta TEXT,
  ADD COLUMN IF NOT EXISTS pix TEXT;
