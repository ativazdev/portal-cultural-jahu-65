-- Add model fields to document requests table
ALTER TABLE public.projeto_solicitacoes_documentos
ADD COLUMN IF NOT EXISTS modelo_url TEXT,
ADD COLUMN IF NOT EXISTS modelo_nome TEXT;
