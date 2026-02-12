-- Add notas_criterios column to avaliacoes_final table
ALTER TABLE public.avaliacoes_final ADD COLUMN IF NOT EXISTS notas_criterios JSONB DEFAULT '{}'::JSONB;

-- Comment on column
COMMENT ON COLUMN public.avaliacoes_final.notas_criterios IS 'Agregado/Cópia das notas atribuídas aos critérios personalizados em formato JSON';
