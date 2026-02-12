-- ============================================
-- CORRIGIR POLÍTICA RLS PARA PARECERISTAS CRIAREM DÚVIDAS
-- ============================================
-- Política simplificada com fallbacks para quando o JWT não pode ser lido
-- Verifica diretamente os claims do JWT ou usa as funções auxiliares como fallback

DROP POLICY IF EXISTS "duvidas_insert_parecerista" ON duvidas;

CREATE POLICY "duvidas_insert_parecerista"
ON duvidas FOR INSERT
TO authenticated
WITH CHECK (
  -- Apenas verificar se parecerista_id e prefeitura_id estão presentes
  -- e se o parecerista_id corresponde ao sub do JWT (se disponível)
  parecerista_id IS NOT NULL
  AND prefeitura_id IS NOT NULL
  AND (
    -- Se conseguimos ler o JWT, verificar correspondência
    (
      COALESCE(
        (auth.jwt() ->> 'sub'),
        (current_setting('request.jwt.claims', true)::json ->> 'sub'),
        NULL
      ) IS NOT NULL
      AND parecerista_id::text = COALESCE(
        (auth.jwt() ->> 'sub'),
        (current_setting('request.jwt.claims', true)::json ->> 'sub'),
        NULL
      )
    )
    -- Se não conseguimos ler o JWT, permitir se a função is_parecerista() retorna true
    OR (
      COALESCE(
        (auth.jwt() ->> 'sub'),
        (current_setting('request.jwt.claims', true)::json ->> 'sub'),
        NULL
      ) IS NULL
      AND is_parecerista()
    )
  )
);

