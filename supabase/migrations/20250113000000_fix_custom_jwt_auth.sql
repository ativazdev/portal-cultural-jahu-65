-- Esta migration foi criada para documentar as mudanças necessárias nas edge functions
-- As edge functions precisam ser deployadas manualmente via Dashboard

-- COMENTÁRIO: 
-- A edge function auth-usuario-proponente foi atualizada para usar SUPABASE_JWT_SECRET
-- e adicionar role: 'authenticated' no payload do JWT.
-- Fazer deploy manual via Dashboard da Supabase.

-- As políticas RLS já foram aplicadas pela migration anterior
-- e estão usando auth.jwt() para acessar os claims customizados

