-- ============================================
-- RESETAR E APLICAR RLS COMPLETO
-- ============================================
-- Esta migration remove TODAS as políticas RLS existentes
-- e cria políticas RLS seguras e restritivas para todas as tabelas

-- ============================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================

DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Remover todas as políticas de todas as tabelas
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE prefeituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareceristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_proponentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proponentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_habilitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_orcamento_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_final ENABLE ROW LEVEL SECURITY;
ALTER TABLE duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestacoes_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_monitoradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recuperacao_senha_parecerista ENABLE ROW LEVEL SECURITY;
ALTER TABLE recuperacao_senha_proponente ENABLE ROW LEVEL SECURITY;
ALTER TABLE contato_suporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos_comunicacao ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA PREFEITURAS
-- ============================================

-- Usuários autenticados podem ver prefeituras (necessário para login)
CREATE POLICY "prefeituras_select_authenticated"
ON prefeituras FOR SELECT
TO authenticated
USING (true);

-- Apenas usuários da prefeitura podem atualizar sua própria prefeitura
CREATE POLICY "prefeituras_update_own"
ON prefeituras FOR UPDATE
TO authenticated
USING (id = get_prefeitura_id())
WITH CHECK (id = get_prefeitura_id());

-- ============================================
-- POLÍTICAS PARA PARECERISTAS
-- ============================================

-- Pareceristas podem ver APENAS seu próprio perfil
CREATE POLICY "pareceristas_select_own"
ON pareceristas FOR SELECT
TO authenticated
USING (
  (is_parecerista() AND id::text = get_user_id())
);

-- Prefeitura pode ver pareceristas da sua prefeitura
CREATE POLICY "pareceristas_select_prefeitura"
ON pareceristas FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Pareceristas podem atualizar APENAS seu próprio perfil
CREATE POLICY "pareceristas_update_own"
ON pareceristas FOR UPDATE
TO authenticated
USING (is_parecerista() AND id::text = get_user_id())
WITH CHECK (is_parecerista() AND id::text = get_user_id());

-- Prefeitura pode inserir pareceristas
CREATE POLICY "pareceristas_insert_prefeitura"
ON pareceristas FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode atualizar pareceristas da sua prefeitura
CREATE POLICY "pareceristas_update_prefeitura"
ON pareceristas FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode deletar pareceristas da sua prefeitura
CREATE POLICY "pareceristas_delete_prefeitura"
ON pareceristas FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA USUÁRIOS PROPONENTES
-- ============================================

-- Usuários podem ver APENAS seu próprio perfil
CREATE POLICY "usuarios_proponentes_select_own"
ON usuarios_proponentes FOR SELECT
TO authenticated
USING (
  (is_proponente() AND id::text = get_user_id())
);

-- Prefeitura pode ver usuários da sua prefeitura
CREATE POLICY "usuarios_proponentes_select_prefeitura"
ON usuarios_proponentes FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem atualizar APENAS seu próprio perfil
CREATE POLICY "usuarios_proponentes_update_own"
ON usuarios_proponentes FOR UPDATE
TO authenticated
USING (is_proponente() AND id::text = get_user_id())
WITH CHECK (is_proponente() AND id::text = get_user_id());

-- Permitir inserção apenas para cadastro (com validação de prefeitura)
CREATE POLICY "usuarios_proponentes_insert"
ON usuarios_proponentes FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND prefeitura_id = get_prefeitura_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- ============================================
-- POLÍTICAS PARA PROPONENTES
-- ============================================

-- Usuários podem ver APENAS seus proponentes
CREATE POLICY "proponentes_select_own"
ON proponentes FOR SELECT
TO authenticated
USING (
  (is_proponente() AND usuario_id::text = get_user_id())
);

-- Prefeitura pode ver proponentes da sua prefeitura
CREATE POLICY "proponentes_select_prefeitura"
ON proponentes FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem inserir proponentes APENAS para si mesmos
CREATE POLICY "proponentes_insert_own"
ON proponentes FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND usuario_id::text = get_user_id() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode inserir proponentes
CREATE POLICY "proponentes_insert_prefeitura"
ON proponentes FOR INSERT
TO authenticated
WITH CHECK (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem atualizar APENAS seus proponentes
CREATE POLICY "proponentes_update_own"
ON proponentes FOR UPDATE
TO authenticated
USING (is_proponente() AND usuario_id::text = get_user_id())
WITH CHECK (
  is_proponente() AND usuario_id::text = get_user_id() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode atualizar proponentes da sua prefeitura
CREATE POLICY "proponentes_update_prefeitura"
ON proponentes FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Usuários podem deletar APENAS seus proponentes
CREATE POLICY "proponentes_delete_own"
ON proponentes FOR DELETE
TO authenticated
USING (
  (is_proponente() AND usuario_id::text = get_user_id())
);

-- Prefeitura pode deletar proponentes da sua prefeitura
CREATE POLICY "proponentes_delete_prefeitura"
ON proponentes FOR DELETE
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- ============================================
-- POLÍTICAS PARA EDITAIS
-- ============================================

-- Todos podem ver editais públicos (necessário para proponentes verem editais)
CREATE POLICY "editais_select_public"
ON editais FOR SELECT
TO authenticated
USING (
  status IN ('recebendo_projetos', 'avaliacao', 'recurso', 'contra_razao', 'em_execucao', 'finalizado', 'ativo', 'arquivado')
);

-- Prefeitura pode ver TODOS os seus editais (incluindo rascunhos)
CREATE POLICY "editais_select_prefeitura"
ON editais FOR SELECT
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Apenas prefeitura pode inserir editais
CREATE POLICY "editais_insert_prefeitura"
ON editais FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Apenas prefeitura pode atualizar seus editais
CREATE POLICY "editais_update_prefeitura"
ON editais FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Apenas prefeitura pode deletar seus editais
CREATE POLICY "editais_delete_prefeitura"
ON editais FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA PROJETOS
-- ============================================

-- Proponentes podem ver APENAS seus projetos
CREATE POLICY "projetos_select_proponente"
ON projetos FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode ver projetos da sua prefeitura
CREATE POLICY "projetos_select_prefeitura"
ON projetos FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Pareceristas podem ver APENAS projetos atribuídos a eles
CREATE POLICY "projetos_select_parecerista"
ON projetos FOR SELECT
TO authenticated
USING (
  (is_parecerista() AND EXISTS (
    SELECT 1 FROM avaliacoes a
    WHERE a.projeto_id = projetos.id
    AND a.parecerista_id::text = get_user_id()
  ))
);

-- Proponentes podem inserir projetos APENAS para seus proponentes
CREATE POLICY "projetos_insert_proponente"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  ))
);

-- Prefeitura pode inserir projetos
CREATE POLICY "projetos_insert_prefeitura"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem atualizar APENAS seus projetos em rascunho
CREATE POLICY "projetos_update_proponente"
ON projetos FOR UPDATE
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
  ) AND status = 'rascunho')
)
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  ))
);

-- Prefeitura pode atualizar projetos da sua prefeitura
CREATE POLICY "projetos_update_prefeitura"
ON projetos FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Apenas prefeitura pode deletar projetos
CREATE POLICY "projetos_delete_prefeitura"
ON projetos FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA AVALIAÇÕES
-- ============================================

-- Pareceristas podem ver APENAS suas avaliações
CREATE POLICY "avaliacoes_select_parecerista"
ON avaliacoes FOR SELECT
TO authenticated
USING (
  (is_parecerista() AND parecerista_id::text = get_user_id())
);

-- Prefeitura pode ver avaliações da sua prefeitura
CREATE POLICY "avaliacoes_select_prefeitura"
ON avaliacoes FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem ver avaliações de seus projetos
CREATE POLICY "avaliacoes_select_proponente"
ON avaliacoes FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = avaliacoes.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Apenas prefeitura pode inserir avaliações
CREATE POLICY "avaliacoes_insert_prefeitura"
ON avaliacoes FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Pareceristas podem atualizar APENAS suas avaliações
CREATE POLICY "avaliacoes_update_parecerista"
ON avaliacoes FOR UPDATE
TO authenticated
USING (is_parecerista() AND parecerista_id::text = get_user_id())
WITH CHECK (is_parecerista() AND parecerista_id::text = get_user_id());

-- Prefeitura pode atualizar avaliações da sua prefeitura
CREATE POLICY "avaliacoes_update_prefeitura"
ON avaliacoes FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Apenas prefeitura pode deletar avaliações
CREATE POLICY "avaliacoes_delete_prefeitura"
ON avaliacoes FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA AVALIAÇÕES FINAL
-- ============================================

-- Prefeitura pode ver avaliações finais da sua prefeitura
CREATE POLICY "avaliacoes_final_select_prefeitura"
ON avaliacoes_final FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem ver avaliações finais de seus projetos
CREATE POLICY "avaliacoes_final_select_proponente"
ON avaliacoes_final FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = avaliacoes_final.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Apenas prefeitura pode inserir/atualizar avaliações finais
CREATE POLICY "avaliacoes_final_manage_prefeitura"
ON avaliacoes_final FOR ALL
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA DÚVIDAS
-- ============================================

-- Proponentes podem ver APENAS suas dúvidas
CREATE POLICY "duvidas_select_proponente"
ON duvidas FOR SELECT
TO authenticated
USING (
  (is_proponente() AND proponente_id::text = get_user_id())
);

-- Pareceristas podem ver dúvidas da sua prefeitura
CREATE POLICY "duvidas_select_parecerista"
ON duvidas FOR SELECT
TO authenticated
USING (
  (is_parecerista() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode ver dúvidas da sua prefeitura
CREATE POLICY "duvidas_select_prefeitura"
ON duvidas FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem criar dúvidas
CREATE POLICY "duvidas_insert_proponente"
ON duvidas FOR INSERT
TO authenticated
WITH CHECK (
  is_proponente() AND proponente_id::text = get_user_id() AND prefeitura_id = get_prefeitura_id()
);

-- Apenas prefeitura pode responder/atualizar dúvidas
CREATE POLICY "duvidas_update_prefeitura"
ON duvidas FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA RECURSOS
-- ============================================

-- Proponentes podem ver recursos de seus proponentes
CREATE POLICY "recursos_select_proponente"
ON recursos FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = recursos.proponente_id
    AND p.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode ver recursos da sua prefeitura
CREATE POLICY "recursos_select_prefeitura"
ON recursos FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem criar recursos APENAS para seus proponentes
CREATE POLICY "recursos_insert_proponente"
ON recursos FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = recursos.proponente_id
    AND p.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  ))
);

-- Apenas prefeitura pode atualizar recursos
CREATE POLICY "recursos_update_prefeitura"
ON recursos FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA TABELAS RELACIONADAS A PROJETOS
-- ============================================

-- Metas do projeto
CREATE POLICY "metas_projeto_manage"
ON metas_projeto FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = metas_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = metas_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
);

-- Equipe do projeto
CREATE POLICY "equipe_projeto_manage"
ON equipe_projeto FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = equipe_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = equipe_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
);

-- Documentos de habilitação
CREATE POLICY "documentos_habilitacao_manage"
ON documentos_habilitacao FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = documentos_habilitacao.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = documentos_habilitacao.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
);

-- Itens de orçamento
CREATE POLICY "itens_orcamento_manage"
ON itens_orcamento_projeto FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = itens_orcamento_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = itens_orcamento_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
);

-- Atividades do projeto
CREATE POLICY "atividades_projeto_manage"
ON atividades_projeto FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = atividades_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = atividades_projeto.projeto_id
    AND (
      (is_proponente() AND EXISTS (
        SELECT 1 FROM proponentes prop
        WHERE prop.id = p.proponente_id
        AND prop.usuario_id::text = get_user_id()
      )) OR
      (is_prefeitura_user() AND p.prefeitura_id = get_prefeitura_id())
    )
  )
);

-- ============================================
-- POLÍTICAS PARA PRESTAÇÕES DE CONTAS
-- ============================================

-- Prefeitura pode ver prestações de contas da sua prefeitura
CREATE POLICY "prestacoes_contas_select_prefeitura"
ON prestacoes_contas FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem ver prestações de contas de seus projetos
CREATE POLICY "prestacoes_contas_select_proponente"
ON prestacoes_contas FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = prestacoes_contas.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Proponentes podem inserir prestações de contas APENAS para seus projetos
CREATE POLICY "prestacoes_contas_insert_proponente"
ON prestacoes_contas FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = prestacoes_contas.projeto_id
    AND prop.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  ))
);

-- Apenas prefeitura pode atualizar prestações de contas
CREATE POLICY "prestacoes_contas_update_prefeitura"
ON prestacoes_contas FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA MOVIMENTAÇÕES FINANCEIRAS
-- ============================================

-- Prefeitura pode ver movimentações financeiras da sua prefeitura
CREATE POLICY "movimentacoes_financeiras_select_prefeitura"
ON movimentacoes_financeiras FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem ver movimentações financeiras de seus projetos
CREATE POLICY "movimentacoes_financeiras_select_proponente"
ON movimentacoes_financeiras FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = movimentacoes_financeiras.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Apenas prefeitura pode gerenciar movimentações financeiras
CREATE POLICY "movimentacoes_financeiras_manage_prefeitura"
ON movimentacoes_financeiras FOR ALL
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA CONTAS MONITORADAS
-- ============================================

-- Prefeitura pode ver contas monitoradas da sua prefeitura
CREATE POLICY "contas_monitoradas_select_prefeitura"
ON contas_monitoradas FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem ver contas monitoradas de seus projetos
CREATE POLICY "contas_monitoradas_select_proponente"
ON contas_monitoradas FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = contas_monitoradas.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Apenas prefeitura pode gerenciar contas monitoradas
CREATE POLICY "contas_monitoradas_manage_prefeitura"
ON contas_monitoradas FOR ALL
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA PENDÊNCIAS
-- ============================================

-- Prefeitura pode ver pendências dos seus projetos
CREATE POLICY "pendencias_select_prefeitura"
ON pendencias FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = pendencias.projeto_id
    AND p.prefeitura_id = get_prefeitura_id()
  ))
);

-- Proponentes podem ver pendências de seus projetos
CREATE POLICY "pendencias_select_proponente"
ON pendencias FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = pendencias.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Apenas prefeitura pode criar pendências
CREATE POLICY "pendencias_insert_prefeitura"
ON pendencias FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = pendencias.projeto_id
    AND p.prefeitura_id = get_prefeitura_id()
  )
);

-- Prefeitura pode atualizar pendências dos seus projetos
CREATE POLICY "pendencias_update_prefeitura"
ON pendencias FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = pendencias.projeto_id
    AND p.prefeitura_id = get_prefeitura_id()
  )
)
WITH CHECK (
  is_prefeitura_user() AND EXISTS (
    SELECT 1 FROM projetos p
    WHERE p.id = pendencias.projeto_id
    AND p.prefeitura_id = get_prefeitura_id()
  )
);

-- Proponentes podem atualizar pendências de seus projetos
CREATE POLICY "pendencias_update_proponente"
ON pendencias FOR UPDATE
TO authenticated
USING (
  is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = pendencias.projeto_id
    AND prop.usuario_id::text = get_user_id()
  )
)
WITH CHECK (
  is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = pendencias.projeto_id
    AND prop.usuario_id::text = get_user_id()
  )
);

-- ============================================
-- POLÍTICAS PARA USER_PROFILES
-- ============================================

-- Usuários podem ver APENAS seu próprio perfil
CREATE POLICY "user_profiles_select_own"
ON user_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Prefeitura pode ver perfis da sua prefeitura
CREATE POLICY "user_profiles_select_prefeitura"
ON user_profiles FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem atualizar APENAS seu próprio perfil
CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir inserção apenas para cadastro
CREATE POLICY "user_profiles_insert"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- POLÍTICAS PARA RECUPERAÇÃO DE SENHA
-- ============================================

-- Apenas acesso interno (via edge functions com service role)
-- Estas tabelas devem ser acessadas apenas por edge functions
CREATE POLICY "recuperacao_senha_parecerista_internal"
ON recuperacao_senha_parecerista FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "recuperacao_senha_proponente_internal"
ON recuperacao_senha_proponente FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA CONTATO SUPORTE
-- ============================================

-- Todos os usuários autenticados podem ler contato ativo
CREATE POLICY "contato_suporte_select"
ON contato_suporte FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas prefeitura pode gerenciar contato de suporte
CREATE POLICY "contato_suporte_manage_prefeitura"
ON contato_suporte FOR ALL
TO authenticated
USING (is_prefeitura_user())
WITH CHECK (is_prefeitura_user());

-- ============================================
-- POLÍTICAS PARA ANEXOS COMUNICAÇÃO
-- ============================================

-- Apenas prefeitura pode gerenciar anexos (se houver tabela comunicacoes)
-- Nota: Se a tabela comunicacoes não existir, esta política falhará silenciosamente
CREATE POLICY "anexos_comunicacao_manage"
ON anexos_comunicacao FOR ALL
TO authenticated
USING (
  is_prefeitura_user()
)
WITH CHECK (
  is_prefeitura_user()
);

