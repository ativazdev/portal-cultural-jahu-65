-- ============================================
-- CRIAR FUNÇÃO DE DEBUG E CORRIGIR RLS PARA PROJETOS
-- ============================================

-- Função de debug para verificar valores do JWT e políticas
CREATE OR REPLACE FUNCTION debug_rls_projetos()
RETURNS TABLE (
  user_type TEXT,
  user_id TEXT,
  prefeitura_id UUID,
  is_proponente_result BOOLEAN,
  proponente_exists BOOLEAN,
  proponente_id_param UUID
) AS $$
DECLARE
  v_user_type TEXT;
  v_user_id TEXT;
  v_prefeitura_id UUID;
  v_is_proponente BOOLEAN;
  v_proponente_exists BOOLEAN;
BEGIN
  -- Obter valores do JWT
  v_user_type := get_user_type();
  v_user_id := get_user_id();
  v_prefeitura_id := get_prefeitura_id();
  v_is_proponente := (v_user_type = 'proponente');
  
  -- Verificar se existe proponente com usuario_id
  SELECT EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.usuario_id::text = v_user_id
  ) INTO v_proponente_exists;
  
  RETURN QUERY SELECT 
    v_user_type,
    v_user_id,
    v_prefeitura_id,
    v_is_proponente,
    v_proponente_exists,
    NULL::UUID as proponente_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para verificar se proponente pertence ao usuário
-- Esta função usa SECURITY DEFINER para bypassar RLS na tabela proponentes
CREATE OR REPLACE FUNCTION verificar_proponente_usuario(p_proponente_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id TEXT;
  v_result BOOLEAN;
BEGIN
  v_user_id := get_user_id();
  
  -- Verificar se o proponente existe e pertence ao usuário
  -- SECURITY DEFINER permite bypassar RLS
  SELECT EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = p_proponente_id
    AND p.usuario_id::text = v_user_id
  ) INTO v_result;
  
  RETURN COALESCE(v_result, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Remover política antiga
DROP POLICY IF EXISTS "projetos_insert_proponente" ON projetos;

-- Criar nova política usando a função auxiliar SECURITY DEFINER
-- Isso evita problemas com RLS na tabela proponentes
CREATE POLICY "projetos_insert_proponente"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND verificar_proponente_usuario(projetos.proponente_id))
);

