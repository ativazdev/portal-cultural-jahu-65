-- ============================================
-- POLÍTICAS RLS PARA PROPONENTES - USUÁRIOS
-- ============================================

-- Primeiro, vamos garantir que temos políticas que permitam aos usuarios_proponentes verem seus próprios proponentes

-- Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Proponentes podem ver seu perfil" ON proponentes;
DROP POLICY IF EXISTS "Proponentes podem atualizar seu perfil" ON proponentes;
DROP POLICY IF EXISTS "Prefeitura pode gerenciar proponentes" ON proponentes;

-- Criar política para usuarios_proponentes verem seus próprios proponentes
CREATE POLICY "Usuários podem ver seus próprios proponentes"
ON proponentes FOR SELECT
USING (
  usuario_id IN (
    SELECT id FROM usuarios_proponentes
  )
);

-- Criar política para usuarios_proponentes atualizarem seus próprios proponentes
CREATE POLICY "Usuários podem atualizar seus próprios proponentes"
ON proponentes FOR UPDATE
USING (
  usuario_id IN (
    SELECT id FROM usuarios_proponentes
  )
)
WITH CHECK (
  usuario_id IN (
    SELECT id FROM usuarios_proponentes
  )
);

-- Criar política para usuarios_proponentes inserirem proponentes
CREATE POLICY "Usuários podem inserir seus próprios proponentes"
ON proponentes FOR INSERT
WITH CHECK (
  usuario_id IN (
    SELECT id FROM usuarios_proponentes
  )
);

-- Criar política para usuarios_proponentes deletarem seus próprios proponentes
CREATE POLICY "Usuários podem deletar seus próprios proponentes"
ON proponentes FOR DELETE
USING (
  usuario_id IN (
    SELECT id FROM usuarios_proponentes
  )
);

-- Criar política para prefeitura gerenciar proponentes (via user_profiles)
CREATE POLICY "Prefeitura pode ver proponentes"
ON proponentes FOR SELECT
USING (
  prefeitura_id IN (
    SELECT prefeitura_id FROM user_profiles WHERE id IS NOT NULL
  )
);

CREATE POLICY "Prefeitura pode gerenciar proponentes"
ON proponentes FOR ALL
USING (
  prefeitura_id IN (
    SELECT prefeitura_id FROM user_profiles WHERE id IS NOT NULL
  )
);

