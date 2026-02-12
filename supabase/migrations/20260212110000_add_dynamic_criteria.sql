-- Add criterios_avaliacao column to editais table
ALTER TABLE public.editais ADD COLUMN IF NOT EXISTS criterios_avaliacao JSONB DEFAULT '[]'::JSONB;

-- Add notas_criterios column to avaliacoes table
ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS notas_criterios JSONB DEFAULT '{}'::JSONB;

-- Comment on columns
COMMENT ON COLUMN public.editais.criterios_avaliacao IS 'Lista de critérios de avaliação personalizados em formato JSON';
COMMENT ON COLUMN public.avaliacoes.notas_criterios IS 'Notas atribuídas aos critérios personalizados em formato JSON';
