-- Migration: Edital Enhancements - Accountability Phase and Extensions
-- Descrição: Adiciona colunas para controle de editais especiais e prorrogação de prazos

-- Adicionar colunas em editais
ALTER TABLE editais ADD COLUMN IF NOT EXISTS has_accountability_phase BOOLEAN DEFAULT false;
ALTER TABLE editais ADD COLUMN IF NOT EXISTS data_prorrogacao DATE;

-- Adicionar coluna titulo em arquivos_edital se não existir
ALTER TABLE arquivos_edital ADD COLUMN IF NOT EXISTS titulo TEXT;

-- Atualizar arquivos_edital existentes para ter título igual ao nome, se nulo
UPDATE arquivos_edital SET titulo = nome WHERE titulo IS NULL;

-- Adicionar anexos_prestacao em projetos para editais especiais
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS anexos_prestacao JSONB;

-- Comentários explicativos
COMMENT ON COLUMN editais.has_accountability_phase IS 'Indica se o edital é especial (apenas prestação de contas)';
COMMENT ON COLUMN editais.data_prorrogacao IS 'Nova data de encerramento do edital caso tenha sido prorrogado';
COMMENT ON COLUMN arquivos_edital.titulo IS 'Título amigável para exibição do anexo do edital';
COMMENT ON COLUMN projetos.anexos_prestacao IS 'Arquivos enviados como prestação de contas em editais especiais';
