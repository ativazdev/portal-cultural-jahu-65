-- ============================================
-- CRIAR BUCKET PARA ARQUIVOS DE EDITAIS
-- ============================================

-- Criar bucket para arquivos de editais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'editais',
  'editais', 
  true,
  104857600, -- 100MB
  ARRAY[
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'image/png', 
    'image/jpeg', 
    'image/jpg'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Política RLS para permitir leitura pública dos arquivos
CREATE POLICY "Arquivos de editais são públicos para leitura" ON storage.objects
FOR SELECT USING (bucket_id = 'editais');

-- Política RLS para permitir upload apenas para usuários autenticados da prefeitura
CREATE POLICY "Usuários da prefeitura podem fazer upload de arquivos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'editais' 
  AND auth.role() = 'authenticated'
);

-- Política RLS para permitir atualização apenas para usuários autenticados da prefeitura
CREATE POLICY "Usuários da prefeitura podem atualizar arquivos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'editais' 
  AND auth.role() = 'authenticated'
);

-- Política RLS para permitir exclusão apenas para usuários autenticados da prefeitura
CREATE POLICY "Usuários da prefeitura podem deletar arquivos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'editais' 
  AND auth.role() = 'authenticated'
);
