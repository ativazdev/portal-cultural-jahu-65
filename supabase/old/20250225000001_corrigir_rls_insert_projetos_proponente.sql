-- ============================================
-- CORRIGIR POLÍTICA RLS PARA PROPONENTES INSERIREM PROJETOS
-- ============================================
-- A política de INSERT estava verificando prefeitura_id, mas a política de SELECT não verifica.
-- Isso pode causar problemas se get_prefeitura_id() não retornar o valor correto.
-- Vamos simplificar a política para ser consistente com a política de SELECT.

-- Remover política antiga
DROP POLICY IF EXISTS "projetos_insert_proponente" ON projetos;

-- Criar política de INSERT para proponentes (sem verificar prefeitura_id, apenas usuario_id)
-- A verificação de usuario_id já garante que o proponente pertence ao usuário logado
CREATE POLICY "projetos_insert_proponente"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
  ))
);

