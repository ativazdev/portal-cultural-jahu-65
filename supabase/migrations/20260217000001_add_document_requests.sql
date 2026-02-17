-- Create table for document requests (diligências)
CREATE TABLE IF NOT EXISTS public.projeto_solicitacoes_documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
    usuario_solicitante_id UUID REFERENCES auth.users(id),
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'respondido', 'aceito', 'recusado'
    arquivo_url TEXT,
    data_resposta TIMESTAMPTZ,
    observacoes_resposta TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projeto_solicitacoes_documentos ENABLE ROW LEVEL SECURITY;

-- Policies for project proponents to see and update their requests
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

-- Policies for city admins to manage requests
CREATE POLICY "Admins from the same city can see and manage requests"
ON public.projeto_solicitacoes_documentos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projetos p
        JOIN public.editais e ON p.edital_id = e.id
        JOIN public.usuarios_prefeitura up ON e.prefeitura_id = up.prefeitura_id
        WHERE p.id = public.projeto_solicitacoes_documentos.projeto_id
        AND up.usuario_id = auth.uid()
    )
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projeto_solicitacoes_documentos_updated_at
    BEFORE UPDATE ON public.projeto_solicitacoes_documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
