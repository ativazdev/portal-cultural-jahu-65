-- ============================================
-- ADICIONAR RLS PARA PARECERISTAS NAS TABELAS DE PROJETO
-- ============================================
-- Esta migration adiciona políticas RLS para permitir que pareceristas
-- acessem atividades_projeto, equipe_projeto, itens_orcamento_projeto e metas_projeto
-- seguindo o mesmo padrão usado para proponentes

-- ============================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR SE PARECERISTA AVALIA PROJETO
-- ============================================
-- Função SECURITY DEFINER para evitar recursão nas políticas RLS
CREATE OR REPLACE FUNCTION public.check_parecerista_avalia_projeto(p_projeto_id uuid, p_parecerista_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM avaliacoes a
    WHERE a.projeto_id = p_projeto_id
    AND TRIM(a.parecerista_id::text) = TRIM(p_parecerista_id)
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.check_parecerista_avalia_projeto(uuid, text) TO authenticated;

-- ============================================
-- POLÍTICAS PARA ATIVIDADES_PROJETO
-- ============================================

-- Remover política antiga se existir para evitar conflitos
DROP POLICY IF EXISTS "atividades_projeto_select_parecerista" ON public.atividades_projeto;

-- Pareceristas podem ver atividades de projetos que estão avaliando
CREATE POLICY "atividades_projeto_select_parecerista"
ON public.atividades_projeto FOR SELECT
TO authenticated
USING (
  is_parecerista() AND check_parecerista_avalia_projeto(projeto_id, get_user_id())
);

-- ============================================
-- POLÍTICAS PARA EQUIPE_PROJETO
-- ============================================

-- Remover política antiga se existir para evitar conflitos
DROP POLICY IF EXISTS "equipe_projeto_select_parecerista" ON public.equipe_projeto;

-- Pareceristas podem ver equipe de projetos que estão avaliando
CREATE POLICY "equipe_projeto_select_parecerista"
ON public.equipe_projeto FOR SELECT
TO authenticated
USING (
  is_parecerista() AND check_parecerista_avalia_projeto(projeto_id, get_user_id())
);

-- ============================================
-- POLÍTICAS PARA ITENS_ORCAMENTO_PROJETO
-- ============================================

-- Remover política antiga se existir para evitar conflitos
DROP POLICY IF EXISTS "itens_orcamento_projeto_select_parecerista" ON public.itens_orcamento_projeto;

-- Pareceristas podem ver itens de orçamento de projetos que estão avaliando
CREATE POLICY "itens_orcamento_projeto_select_parecerista"
ON public.itens_orcamento_projeto FOR SELECT
TO authenticated
USING (
  is_parecerista() AND check_parecerista_avalia_projeto(projeto_id, get_user_id())
);

-- ============================================
-- POLÍTICAS PARA METAS_PROJETO
-- ============================================

-- Remover política antiga se existir para evitar conflitos
DROP POLICY IF EXISTS "metas_projeto_select_parecerista" ON public.metas_projeto;

-- Pareceristas podem ver metas de projetos que estão avaliando
CREATE POLICY "metas_projeto_select_parecerista"
ON public.metas_projeto FOR SELECT
TO authenticated
USING (
  is_parecerista() AND check_parecerista_avalia_projeto(projeto_id, get_user_id())
);

