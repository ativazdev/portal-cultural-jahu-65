-- ============================================
-- ATUALIZAR POLÍTICA RLS PARA PERMITIR VISUALIZAÇÃO DE EDITAIS RECEBENDO PROJETOS
-- ============================================

-- Remover a política antiga
DROP POLICY IF EXISTS "Todos podem ver editais ativos" ON editais;

-- Criar nova política que inclui recebendo_projetos e outros status relevantes
CREATE POLICY "Todos podem ver editais recebendo projetos"
ON editais FOR SELECT
USING (
  status = 'recebendo_projetos' 
  OR status = 'avaliacao'
  OR status = 'recurso'
  OR status = 'contra_razao'
  OR status = 'em_execucao'
  OR status = 'finalizado'
  OR status = 'ativo' -- Legacy
  OR status = 'arquivado' -- Legacy
);

COMMENT ON POLICY "Todos podem ver editais recebendo projetos" ON editais IS 'Permite que proponentes e outros usuários vejam editais que estão recebendo projetos ou em outras fases relevantes';

