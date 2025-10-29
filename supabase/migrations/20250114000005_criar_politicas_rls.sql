-- ============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE prefeituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareceristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proponentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_edital ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_habilitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE planilha_orcamentaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos_comunicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestacoes_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_monitoradas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA PREFEITURAS
-- ============================================

-- Usuários da prefeitura podem ver sua prefeitura
CREATE POLICY "Usuários podem ver sua prefeitura"
ON prefeituras FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT prefeitura_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- POLÍTICAS PARA PARECERISTAS
-- ============================================

-- Pareceristas podem ver seu próprio perfil
CREATE POLICY "Pareceristas podem ver seu perfil"
ON pareceristas FOR SELECT
USING (true); -- Permitir leitura para todos (necessário para autenticação)

-- Pareceristas podem atualizar seu próprio perfil
CREATE POLICY "Pareceristas podem atualizar seu perfil"
ON pareceristas FOR UPDATE
USING (true) -- Será controlado pela aplicação
WITH CHECK (true);

-- Prefeitura pode gerenciar pareceristas
CREATE POLICY "Prefeitura pode gerenciar pareceristas"
ON pareceristas FOR ALL
TO authenticated
USING (
  prefeitura_id IN (
    SELECT prefeitura_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- POLÍTICAS PARA PROPONENTES
-- ============================================

-- Proponentes podem ver seu próprio perfil
CREATE POLICY "Proponentes podem ver seu perfil"
ON proponentes FOR SELECT
USING (true); -- Permitir leitura para todos (necessário para autenticação)

-- Proponentes podem atualizar seu próprio perfil
CREATE POLICY "Proponentes podem atualizar seu perfil"
ON proponentes FOR UPDATE
USING (true) -- Será controlado pela aplicação
WITH CHECK (true);

-- Prefeitura pode gerenciar proponentes
CREATE POLICY "Prefeitura pode gerenciar proponentes"
ON proponentes FOR ALL
TO authenticated
USING (
  prefeitura_id IN (
    SELECT prefeitura_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- POLÍTICAS PARA EDITAIS
-- ============================================

-- Todos podem ver editais ativos
CREATE POLICY "Todos podem ver editais ativos"
ON editais FOR SELECT
USING (status = 'ativo' OR status = 'arquivado');

-- Prefeitura pode gerenciar editais
CREATE POLICY "Prefeitura pode gerenciar editais"
ON editais FOR ALL
TO authenticated
USING (
  prefeitura_id IN (
    SELECT prefeitura_id FROM profiles WHERE id = auth.uid()
  )
);

-- Arquivos de editais seguem mesma lógica
CREATE POLICY "Todos podem ver arquivos de editais"
ON arquivos_edital FOR SELECT
USING (
  edital_id IN (
    SELECT id FROM editais WHERE status = 'ativo' OR status = 'arquivado'
  )
);

CREATE POLICY "Prefeitura pode gerenciar arquivos de editais"
ON arquivos_edital FOR ALL
TO authenticated
USING (
  edital_id IN (
    SELECT id FROM editais WHERE prefeitura_id IN (
      SELECT prefeitura_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- ============================================
-- POLÍTICAS PARA PROJETOS
-- ============================================

-- Proponentes podem ver e gerenciar seus projetos
CREATE POLICY "Acesso a projetos"
ON projetos FOR ALL
USING (true) -- Será controlado pela aplicação
WITH CHECK (true);

-- Políticas para tabelas relacionadas a projetos
CREATE POLICY "Acesso a metas"
ON metas_projeto FOR ALL
USING (true);

CREATE POLICY "Acesso a equipe"
ON equipe_projeto FOR ALL
USING (true);

CREATE POLICY "Acesso a documentos"
ON documentos_habilitacao FOR ALL
USING (true);

CREATE POLICY "Acesso a planilha"
ON planilha_orcamentaria FOR ALL
USING (true);

-- ============================================
-- POLÍTICAS PARA AVALIAÇÕES
-- ============================================

CREATE POLICY "Acesso a avaliações"
ON avaliacoes FOR ALL
USING (true) -- Será controlado pela aplicação
WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA COMUNICAÇÕES
-- ============================================

CREATE POLICY "Acesso a comunicações"
ON comunicacoes FOR ALL
USING (true) -- Será controlado pela aplicação
WITH CHECK (true);

CREATE POLICY "Acesso a anexos de comunicações"
ON anexos_comunicacao FOR ALL
USING (true);

-- ============================================
-- POLÍTICAS PARA PRESTAÇÕES DE CONTAS
-- ============================================

CREATE POLICY "Acesso a prestações"
ON prestacoes_contas FOR ALL
USING (true) -- Será controlado pela aplicação
WITH CHECK (true);

CREATE POLICY "Acesso a movimentações"
ON movimentacoes_financeiras FOR ALL
USING (true);

CREATE POLICY "Acesso a contas monitoradas"
ON contas_monitoradas FOR ALL
USING (true);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar se um email já existe (parecerista)
CREATE OR REPLACE FUNCTION verificar_email_parecerista(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM pareceristas WHERE email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um email já existe (proponente)
CREATE OR REPLACE FUNCTION verificar_email_proponente(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM proponentes WHERE email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um CPF já existe (parecerista)
CREATE OR REPLACE FUNCTION verificar_cpf_parecerista(p_cpf TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM pareceristas WHERE cpf = p_cpf);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um CPF já existe (proponente)
CREATE OR REPLACE FUNCTION verificar_cpf_proponente(p_cpf TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM proponentes WHERE cpf = p_cpf);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

