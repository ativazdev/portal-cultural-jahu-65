-- Criar buckets para armazenamento de arquivos

-- Bucket para documentos de habilitação
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_habilitacao',
  'documentos_habilitacao',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos gerais de projetos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_projetos',
  'documentos_projetos',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para prestações de contas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prestacoes_contas',
  'prestacoes_contas',
  true,
  104857600, -- 100MB
  ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para arquivos de editais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editais',
  'editais',
  true,
  104857600, -- 100MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS para os buckets

-- Políticas para documentos de habilitação
CREATE POLICY IF NOT EXISTS "Permitir upload de documentos de habilitação"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos_habilitacao');

CREATE POLICY IF NOT EXISTS "Permitir visualização de documentos de habilitação"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos_habilitacao');

CREATE POLICY IF NOT EXISTS "Permitir atualização de documentos de habilitação"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos_habilitacao');

CREATE POLICY IF NOT EXISTS "Permitir remoção de documentos de habilitação"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos_habilitacao');

-- Políticas para documentos de projetos
CREATE POLICY IF NOT EXISTS "Permitir upload de documentos de projetos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos_projetos');

CREATE POLICY IF NOT EXISTS "Permitir visualização de documentos de projetos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos_projetos');

CREATE POLICY IF NOT EXISTS "Permitir atualização de documentos de projetos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos_projetos');

CREATE POLICY IF NOT EXISTS "Permitir remoção de documentos de projetos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos_projetos');

-- Políticas para prestações de contas
CREATE POLICY IF NOT EXISTS "Permitir upload de prestações de contas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prestacoes_contas');

CREATE POLICY IF NOT EXISTS "Permitir visualização de prestações de contas"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'prestacoes_contas');

CREATE POLICY IF NOT EXISTS "Permitir atualização de prestações de contas"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'prestacoes_contas');

CREATE POLICY IF NOT EXISTS "Permitir remoção de prestações de contas"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'prestacoes_contas');

-- Políticas para editais
CREATE POLICY IF NOT EXISTS "Permitir upload de editais"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'editais');

CREATE POLICY IF NOT EXISTS "Permitir visualização de editais"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'editais');

CREATE POLICY IF NOT EXISTS "Permitir atualização de editais"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'editais');

CREATE POLICY IF NOT EXISTS "Permitir remoção de editais"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'editais');

