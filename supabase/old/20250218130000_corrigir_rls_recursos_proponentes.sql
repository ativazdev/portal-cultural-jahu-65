-- ============================================
-- CORRIGIR POLÍTICA RLS PARA RECURSOS - PROPONENTES
-- ============================================

-- Remover política antiga que usa current_setting
DROP POLICY IF EXISTS "Proponentes podem ver seus recursos" ON recursos;
DROP POLICY IF EXISTS "Proponentes podem criar recursos" ON recursos;

-- Nova política: proponentes podem ver recursos de seus proponentes
-- Um usuário pode ter múltiplos proponentes, então precisa ver recursos de todos eles
CREATE POLICY "Proponentes podem ver seus recursos"
  ON recursos FOR SELECT
  USING (
    proponente_id IN (
      SELECT id FROM proponentes
      WHERE usuario_id IN (
        SELECT id FROM usuarios_proponentes
      )
    )
  );

-- Nova política: proponentes podem criar recursos para seus proponentes
CREATE POLICY "Proponentes podem criar recursos"
  ON recursos FOR INSERT
  WITH CHECK (
    proponente_id IN (
      SELECT id FROM proponentes
      WHERE usuario_id IN (
        SELECT id FROM usuarios_proponentes
      )
    )
  );

COMMENT ON POLICY "Proponentes podem ver seus recursos" ON recursos IS 'Permite que usuários proponentes vejam recursos de todos os seus proponentes vinculados';
COMMENT ON POLICY "Proponentes podem criar recursos" ON recursos IS 'Permite que usuários proponentes criem recursos para qualquer um de seus proponentes vinculados';

