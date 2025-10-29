-- ============================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA PROPONENTES
-- ============================================
-- Como estamos usando localStorage para autenticação e não auth.uid(),
-- vamos desabilitar o RLS temporariamente até implementarmos autenticação adequada

ALTER TABLE proponentes DISABLE ROW LEVEL SECURITY;

