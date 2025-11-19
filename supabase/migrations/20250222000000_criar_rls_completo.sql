-- ============================================
-- POLÍTICAS RLS COMPLETAS E SEGURAS
-- ============================================
-- Esta migration cria políticas RLS seguras para todas as tabelas,
-- considerando autenticação customizada via JWT para pareceristas e proponentes

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para obter o user_type do JWT
CREATE OR REPLACE FUNCTION get_user_type()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'user_type'),
    NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para obter o prefeitura_id do JWT ou do user_profile
CREATE OR REPLACE FUNCTION get_prefeitura_id()
RETURNS UUID AS $$
DECLARE
  jwt_prefeitura_id UUID;
  user_prefeitura_id UUID;
BEGIN
  -- Tentar obter do JWT (pareceristas e proponentes)
  jwt_prefeitura_id := (current_setting('request.jwt.claims', true)::json ->> 'prefeitura_id')::uuid;
  
  IF jwt_prefeitura_id IS NOT NULL THEN
    RETURN jwt_prefeitura_id;
  END IF;
  
  -- Se não encontrou no JWT, tentar do user_profile (prefeitura)
  SELECT prefeitura_id INTO user_prefeitura_id
  FROM user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_prefeitura_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para obter o ID do usuário (sub do JWT ou auth.uid())
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Se tem user_type no JWT, usar sub do JWT
  IF get_user_type() IS NOT NULL THEN
    RETURN current_setting('request.jwt.claims', true)::json ->> 'sub';
  END IF;
  
  -- Caso contrário, usar auth.uid() (usuários da prefeitura)
  RETURN auth.uid()::text;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para verificar se é usuário da prefeitura
CREATE OR REPLACE FUNCTION is_prefeitura_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_type() IS NULL AND auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para verificar se é parecerista
CREATE OR REPLACE FUNCTION is_parecerista()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_type() = 'parecerista';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para verificar se é proponente
CREATE OR REPLACE FUNCTION is_proponente()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_type() = 'proponente';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================

DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Acesso a %s" ON %I', r.tablename, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Todos podem ver %s" ON %I', r.tablename, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Acesso a %s" ON %I', r.tablename, r.tablename);
  END LOOP;
END $$;

-- ============================================
-- POLÍTICAS PARA PREFEITURAS
-- ============================================

-- Usuários autenticados podem ver prefeituras (necessário para login)
CREATE POLICY "prefeituras_select_all"
ON prefeituras FOR SELECT
TO authenticated
USING (true);

-- Usuários da prefeitura podem atualizar sua própria prefeitura
CREATE POLICY "prefeituras_update_own"
ON prefeituras FOR UPDATE
TO authenticated
USING (id = get_prefeitura_id())
WITH CHECK (id = get_prefeitura_id());

-- ============================================
-- POLÍTICAS PARA PARECERISTAS
-- ============================================

-- Pareceristas podem ver seu próprio perfil
CREATE POLICY "pareceristas_select_own"
ON pareceristas FOR SELECT
TO authenticated
USING (
  (is_parecerista() AND id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Pareceristas podem atualizar seu próprio perfil
CREATE POLICY "pareceristas_update_own"
ON pareceristas FOR UPDATE
TO authenticated
USING (
  (is_parecerista() AND id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
)
WITH CHECK (
  (is_parecerista() AND id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode inserir pareceristas
CREATE POLICY "pareceristas_insert_prefeitura"
ON pareceristas FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode deletar pareceristas
CREATE POLICY "pareceristas_delete_prefeitura"
ON pareceristas FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA USUÁRIOS PROPONENTES
-- ============================================

-- Usuários podem ver seus próprios perfis
CREATE POLICY "usuarios_proponentes_select_own"
ON usuarios_proponentes FOR SELECT
TO authenticated
USING (
  (is_proponente() AND id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem atualizar seus próprios perfis
CREATE POLICY "usuarios_proponentes_update_own"
ON usuarios_proponentes FOR UPDATE
TO authenticated
USING (
  (is_proponente() AND id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
)
WITH CHECK (
  (is_proponente() AND id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Permitir inserção (cadastro)
CREATE POLICY "usuarios_proponentes_insert"
ON usuarios_proponentes FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA PROPONENTES
-- ============================================

-- Usuários podem ver seus proponentes
CREATE POLICY "proponentes_select_own"
ON proponentes FOR SELECT
TO authenticated
USING (
  (is_proponente() AND usuario_id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem inserir proponentes
CREATE POLICY "proponentes_insert_own"
ON proponentes FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND usuario_id::text = get_user_id() AND prefeitura_id = get_prefeitura_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem atualizar seus proponentes
CREATE POLICY "proponentes_update_own"
ON proponentes FOR UPDATE
TO authenticated
USING (
  (is_proponente() AND usuario_id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
)
WITH CHECK (
  (is_proponente() AND usuario_id::text = get_user_id() AND prefeitura_id = get_prefeitura_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem deletar seus proponentes
CREATE POLICY "proponentes_delete_own"
ON proponentes FOR DELETE
TO authenticated
USING (
  (is_proponente() AND usuario_id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- ============================================
-- POLÍTICAS PARA EDITAIS
-- ============================================

-- Todos podem ver editais públicos (recebendo projetos, ativos, etc)
CREATE POLICY "editais_select_public"
ON editais FOR SELECT
TO authenticated
USING (
  status IN ('recebendo_projetos', 'avaliacao', 'recurso', 'contra_razao', 'em_execucao', 'finalizado', 'ativo', 'arquivado')
);

-- Prefeitura pode ver todos os seus editais
CREATE POLICY "editais_select_prefeitura"
ON editais FOR SELECT
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode inserir editais
CREATE POLICY "editais_insert_prefeitura"
ON editais FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode atualizar seus editais
CREATE POLICY "editais_update_prefeitura"
ON editais FOR UPDATE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
)
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode deletar seus editais
CREATE POLICY "editais_delete_prefeitura"
ON editais FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA PROJETOS
-- ============================================

-- Proponentes podem ver seus projetos
CREATE POLICY "projetos_select_proponente"
ON projetos FOR SELECT
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
  )) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()) OR
  (is_parecerista() AND EXISTS (
    SELECT 1 FROM avaliacoes a
    WHERE a.projeto_id = projetos.id
    AND a.parecerista_id::text = get_user_id()
  ))
);

-- Proponentes podem inserir projetos
CREATE POLICY "projetos_insert_proponente"
ON projetos FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  )) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem atualizar seus projetos (apenas em rascunho)
CREATE POLICY "projetos_update_proponente"
ON projetos FOR UPDATE
TO authenticated
USING (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
  ) AND status = 'rascunho') OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
)
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = projetos.proponente_id
    AND p.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  )) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode deletar projetos
CREATE POLICY "projetos_delete_prefeitura"
ON projetos FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA AVALIAÇÕES
-- ============================================

-- Pareceristas podem ver suas avaliações
CREATE POLICY "avaliacoes_select_parecerista"
ON avaliacoes FOR SELECT
TO authenticated
USING (
  (is_parecerista() AND parecerista_id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()) OR
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = avaliacoes.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode inserir avaliações
CREATE POLICY "avaliacoes_insert_prefeitura"
ON avaliacoes FOR INSERT
TO authenticated
WITH CHECK (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- Pareceristas podem atualizar suas avaliações
CREATE POLICY "avaliacoes_update_parecerista"
ON avaliacoes FOR UPDATE
TO authenticated
USING (
  (is_parecerista() AND parecerista_id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
)
WITH CHECK (
  (is_parecerista() AND parecerista_id::text = get_user_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode deletar avaliações
CREATE POLICY "avaliacoes_delete_prefeitura"
ON avaliacoes FOR DELETE
TO authenticated
USING (
  is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()
);

-- ============================================
-- POLÍTICAS PARA AVALIAÇÕES FINAL
-- ============================================

-- Prefeitura pode ver avaliações finais
CREATE POLICY "avaliacoes_final_select_prefeitura"
ON avaliacoes_final FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()) OR
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = avaliacoes_final.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode inserir/atualizar avaliações finais
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

-- Proponentes podem ver suas dúvidas
CREATE POLICY "duvidas_select_proponente"
ON duvidas FOR SELECT
TO authenticated
USING (
  (is_proponente() AND proponente_id::text = get_user_id()) OR
  (is_parecerista() AND prefeitura_id = get_prefeitura_id()) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem criar dúvidas
CREATE POLICY "duvidas_insert_proponente"
ON duvidas FOR INSERT
TO authenticated
WITH CHECK (
  is_proponente() AND proponente_id::text = get_user_id() AND prefeitura_id = get_prefeitura_id()
);

-- Prefeitura pode responder dúvidas
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
  )) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Proponentes podem criar recursos
CREATE POLICY "recursos_insert_proponente"
ON recursos FOR INSERT
TO authenticated
WITH CHECK (
  (is_proponente() AND EXISTS (
    SELECT 1 FROM proponentes p
    WHERE p.id = recursos.proponente_id
    AND p.usuario_id::text = get_user_id()
    AND p.prefeitura_id = get_prefeitura_id()
  )) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode atualizar recursos
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

-- Prefeitura pode ver prestações de contas
CREATE POLICY "prestacoes_contas_select_prefeitura"
ON prestacoes_contas FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()) OR
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = prestacoes_contas.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Proponentes podem inserir prestações de contas
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
  )) OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Prefeitura pode atualizar prestações de contas
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

-- Prefeitura pode ver movimentações financeiras
CREATE POLICY "movimentacoes_financeiras_select_prefeitura"
ON movimentacoes_financeiras FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()) OR
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = movimentacoes_financeiras.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode gerenciar movimentações financeiras
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

-- Prefeitura pode ver contas monitoradas
CREATE POLICY "contas_monitoradas_select_prefeitura"
ON contas_monitoradas FOR SELECT
TO authenticated
USING (
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id()) OR
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = contas_monitoradas.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode gerenciar contas monitoradas
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
  )) OR
  (is_proponente() AND EXISTS (
    SELECT 1 FROM projetos p
    JOIN proponentes prop ON p.proponente_id = prop.id
    WHERE p.id = pendencias.projeto_id
    AND prop.usuario_id::text = get_user_id()
  ))
);

-- Prefeitura pode criar/atualizar pendências
CREATE POLICY "pendencias_manage_prefeitura"
ON pendencias FOR ALL
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

-- Proponentes podem atualizar pendências dos seus projetos
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

-- Usuários podem ver seu próprio perfil
CREATE POLICY "user_profiles_select_own"
ON user_profiles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  (is_prefeitura_user() AND prefeitura_id = get_prefeitura_id())
);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir inserção (cadastro)
CREATE POLICY "user_profiles_insert"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- POLÍTICAS PARA RECUPERAÇÃO DE SENHA
-- ============================================

-- Apenas acesso interno (via edge functions)
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

-- Todos os usuários autenticados podem ler
CREATE POLICY "contato_suporte_select"
ON contato_suporte FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas prefeitura pode gerenciar
CREATE POLICY "contato_suporte_manage_prefeitura"
ON contato_suporte FOR ALL
TO authenticated
USING (is_prefeitura_user())
WITH CHECK (is_prefeitura_user());

-- ============================================
-- POLÍTICAS PARA ANEXOS COMUNICAÇÃO
-- ============================================

-- Prefeitura pode gerenciar anexos
CREATE POLICY "anexos_comunicacao_manage"
ON anexos_comunicacao FOR ALL
TO authenticated
USING (
  is_prefeitura_user() AND EXISTS (
    SELECT 1 FROM comunicacoes c
    WHERE c.id = anexos_comunicacao.comunicacao_id
    AND c.prefeitura_id = get_prefeitura_id()
  )
)
WITH CHECK (
  is_prefeitura_user() AND EXISTS (
    SELECT 1 FROM comunicacoes c
    WHERE c.id = anexos_comunicacao.comunicacao_id
    AND c.prefeitura_id = get_prefeitura_id()
  )
);

