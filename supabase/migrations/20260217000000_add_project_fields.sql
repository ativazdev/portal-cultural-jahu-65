-- Migration to add new fields to the projetos table for enhanced registration workflow
ALTER TABLE projetos 
ADD COLUMN IF NOT EXISTS concorre_cotas BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cotas_tipo TEXT,
ADD COLUMN IF NOT EXISTS formato TEXT,
ADD COLUMN IF NOT EXISTS cep_realizacao TEXT,
ADD COLUMN IF NOT EXISTS num_remunerados TEXT,
ADD COLUMN IF NOT EXISTS segmento_contemplado TEXT,
ADD COLUMN IF NOT EXISTS etapa_principal TEXT,
ADD COLUMN IF NOT EXISTS tematicas TEXT,
ADD COLUMN IF NOT EXISTS territorio_prioritario BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS entregas_previstas TEXT,
ADD COLUMN IF NOT EXISTS mini_curriculo_proponente TEXT,
ADD COLUMN IF NOT EXISTS objetivos_especificos TEXT,
ADD COLUMN IF NOT EXISTS venda_produtos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aceite_lgpd BOOLEAN DEFAULT FALSE;

-- Add comments for clarity
COMMENT ON COLUMN projetos.concorre_cotas IS 'Indica se o projeto concorre a cotas';
COMMENT ON COLUMN projetos.cotas_tipo IS 'Tipo de cota (negro, indigena, pcd)';
COMMENT ON COLUMN projetos.formato IS 'Formato do projeto (presencial, remoto, etc)';
COMMENT ON COLUMN projetos.entregas_previstas IS 'Principais entregas do projeto';
COMMENT ON COLUMN projetos.aceite_lgpd IS 'Termo de ciência e concordância LGPD';
