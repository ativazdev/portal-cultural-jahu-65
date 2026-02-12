-- Corrigir políticas RLS para itens_orcamento_projeto
-- Permitir acesso tanto para usuários da prefeitura quanto para proponentes

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto;
DROP POLICY IF EXISTS "Users can insert itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto;
DROP POLICY IF EXISTS "Users can update itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto;
DROP POLICY IF EXISTS "Users can delete itens_orcamento_projeto for their prefeitura" ON itens_orcamento_projeto;

-- Criar políticas que permitem acesso para usuários da prefeitura E proponentes
CREATE POLICY "Users can view itens_orcamento_projeto" ON itens_orcamento_projeto
  FOR SELECT USING (
    -- Usuários da prefeitura
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = itens_orcamento_projeto.projeto_id 
      AND e.prefeitura_id = (auth.jwt() ->> 'prefeitura_id')::uuid
    )
    OR
    -- Proponentes (usuários que têm projetos)
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN proponentes prop ON p.proponente_id = prop.id
      WHERE p.id = itens_orcamento_projeto.projeto_id 
      AND prop.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert itens_orcamento_projeto" ON itens_orcamento_projeto
  FOR INSERT WITH CHECK (
    -- Usuários da prefeitura
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = projeto_id 
      AND e.prefeitura_id = (auth.jwt() ->> 'prefeitura_id')::uuid
    )
    OR
    -- Proponentes (usuários que têm projetos)
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN proponentes prop ON p.proponente_id = prop.id
      WHERE p.id = projeto_id 
      AND prop.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can update itens_orcamento_projeto" ON itens_orcamento_projeto
  FOR UPDATE USING (
    -- Usuários da prefeitura
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = projeto_id 
      AND e.prefeitura_id = (auth.jwt() ->> 'prefeitura_id')::uuid
    )
    OR
    -- Proponentes (usuários que têm projetos)
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN proponentes prop ON p.proponente_id = prop.id
      WHERE p.id = projeto_id 
      AND prop.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete itens_orcamento_projeto" ON itens_orcamento_projeto
  FOR DELETE USING (
    -- Usuários da prefeitura
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN editais e ON p.edital_id = e.id 
      WHERE p.id = projeto_id 
      AND e.prefeitura_id = (auth.jwt() ->> 'prefeitura_id')::uuid
    )
    OR
    -- Proponentes (usuários que têm projetos)
    EXISTS (
      SELECT 1 FROM projetos p 
      JOIN proponentes prop ON p.proponente_id = prop.id
      WHERE p.id = projeto_id 
      AND prop.usuario_id = auth.uid()
    )
  );
