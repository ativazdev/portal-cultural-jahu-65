-- ============================================
-- ADICIONAR POLÍTICA RLS PARA PARECERISTAS INSERIREM DÚVIDAS
-- ============================================
-- Esta política permite que pareceristas criem dúvidas na tabela duvidas
-- Segue o mesmo padrão da política de SELECT para pareceristas

-- Remover política antiga se existir
DROP POLICY IF EXISTS "duvidas_insert_parecerista" ON duvidas;

-- Criar política de INSERT para pareceristas
CREATE POLICY "duvidas_insert_parecerista"
ON duvidas FOR INSERT
TO authenticated
WITH CHECK (
  (is_parecerista() 
   AND parecerista_id::text = get_user_id() 
   AND prefeitura_id = get_prefeitura_id())
);

