-- ============================================
-- ADICIONAR POLÍTICA RLS PARA PARECERISTAS CRIAREM DÚVIDAS
-- ============================================

-- Pareceristas podem criar dúvidas
CREATE POLICY "duvidas_insert_parecerista"
ON duvidas FOR INSERT
TO authenticated
WITH CHECK (
  is_parecerista() 
  AND parecerista_id::text = get_user_id() 
  AND prefeitura_id = get_prefeitura_id()
);

