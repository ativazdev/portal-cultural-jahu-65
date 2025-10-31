-- Migration: Ajustar critérios de avaliação
-- Descrição: Substituir os critérios antigos por novos critérios obrigatórios e bônus

-- Remover colunas antigas
ALTER TABLE avaliacoes 
DROP COLUMN IF EXISTS nota_relevancia,
DROP COLUMN IF EXISTS nota_viabilidade,
DROP COLUMN IF EXISTS nota_impacto,
DROP COLUMN IF EXISTS nota_orcamento,
DROP COLUMN IF EXISTS nota_inovacao,
DROP COLUMN IF EXISTS nota_sustentabilidade;

-- Adicionar novas colunas para critérios obrigatórios
ALTER TABLE avaliacoes 
ADD COLUMN IF NOT EXISTS nota_criterio_a NUMERIC CHECK (nota_criterio_a >= 0 AND nota_criterio_a <= 10),
ADD COLUMN IF NOT EXISTS obs_criterio_a TEXT,
ADD COLUMN IF NOT EXISTS nota_criterio_b NUMERIC CHECK (nota_criterio_b >= 0 AND nota_criterio_b <= 10),
ADD COLUMN IF NOT EXISTS obs_criterio_b TEXT,
ADD COLUMN IF NOT EXISTS nota_criterio_c NUMERIC CHECK (nota_criterio_c >= 0 AND nota_criterio_c <= 10),
ADD COLUMN IF NOT EXISTS obs_criterio_c TEXT,
ADD COLUMN IF NOT EXISTS nota_criterio_d NUMERIC CHECK (nota_criterio_d >= 0 AND nota_criterio_d <= 10),
ADD COLUMN IF NOT EXISTS obs_criterio_d TEXT,
ADD COLUMN IF NOT EXISTS nota_criterio_e NUMERIC CHECK (nota_criterio_e >= 0 AND nota_criterio_e <= 10),
ADD COLUMN IF NOT EXISTS obs_criterio_e TEXT;

-- Adicionar colunas para critérios bônus (opcionais)
ALTER TABLE avaliacoes 
ADD COLUMN IF NOT EXISTS bonus_criterio_f NUMERIC CHECK (bonus_criterio_f >= 0 AND bonus_criterio_f <= 5) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_criterio_g NUMERIC CHECK (bonus_criterio_g >= 0 AND bonus_criterio_g <= 5) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_criterio_h NUMERIC CHECK (bonus_criterio_h >= 0 AND bonus_criterio_h <= 5) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_criterio_i NUMERIC CHECK (bonus_criterio_i >= 0 AND bonus_criterio_i <= 5) DEFAULT 0;

-- Manter nota_final que será calculada como: (A+B+C+D+E) + (F+G+H+I)

