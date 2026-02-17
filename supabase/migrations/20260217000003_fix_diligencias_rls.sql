-- Migration: Fix RLS for project_solicitacoes_documentos
-- Description: Corrects the table name and column names in the RLS policies to use user_profiles instead of usuarios_prefeitura.

-- Drop existing policies that might be incorrect
DROP POLICY IF EXISTS "Admins from the same city can see and manage requests" ON public.projeto_solicitacoes_documentos;
DROP POLICY IF EXISTS "Proponents can see requests for their projects" ON public.projeto_solicitacoes_documentos;
DROP POLICY IF EXISTS "Proponents can update (answer) requests for their projects" ON public.projeto_solicitacoes_documentos;

-- 1. Policy for city admins to see and manage requests
CREATE POLICY "Admins from the same city can see and manage requests"
ON public.projeto_solicitacoes_documentos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projetos p
        JOIN public.editais e ON p.edital_id = e.id
        JOIN public.user_profiles up ON e.prefeitura_id = up.prefeitura_id
        WHERE p.id = public.projeto_solicitacoes_documentos.projeto_id
        AND up.user_id = auth.uid()
    )
);

-- 2. Policy for proponents to see requests for their projects
CREATE POLICY "Proponents can see requests for their projects"
ON public.projeto_solicitacoes_documentos
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projetos p
        JOIN public.proponentes pr ON p.proponente_id = pr.id
        WHERE p.id = public.projeto_solicitacoes_documentos.projeto_id
        AND pr.usuario_id = auth.uid()
    )
);

-- 3. Policy for proponents to update (answer) requests for their projects
CREATE POLICY "Proponents can update (answer) requests for their projects"
ON public.projeto_solicitacoes_documentos
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projetos p
        JOIN public.proponentes pr ON p.proponente_id = pr.id
        WHERE p.id = public.projeto_solicitacoes_documentos.projeto_id
        AND pr.usuario_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projetos p
        JOIN public.proponentes pr ON p.proponente_id = pr.id
        WHERE p.id = public.projeto_solicitacoes_documentos.projeto_id
        AND pr.usuario_id = auth.uid()
    )
);
