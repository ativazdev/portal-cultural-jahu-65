-- ============================================
-- AJUSTE: SEPARAR USUÁRIOS DE PROPONENTES
-- ============================================

-- Um usuário pode ter vários proponentes vinculados
-- O usuário é a credencial de acesso
-- O proponente é o perfil jurídico (PF/PJ/Grupo/COOP)

-- ============================================
-- 1. CRIAR TABELA DE USUÁRIOS (AUTENTICAÇÃO)
-- ============================================

CREATE TABLE usuarios_proponentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  
  -- Dados de autenticação
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  
  -- Dados básicos do usuário
  nome TEXT NOT NULL,
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para usuários
CREATE INDEX idx_usuarios_proponentes_prefeitura ON usuarios_proponentes(prefeitura_id);
CREATE INDEX idx_usuarios_proponentes_email ON usuarios_proponentes(email);

-- ============================================
-- 2. AJUSTAR TABELA DE PROPONENTES
-- ============================================

-- Backup da tabela antiga (caso tenha dados)
CREATE TABLE proponentes_backup AS SELECT * FROM proponentes;

-- Remover tabela antiga
DROP TABLE IF EXISTS proponentes CASCADE;

-- Criar nova tabela de proponentes
CREATE TABLE proponentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefeitura_id UUID NOT NULL REFERENCES prefeituras(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios_proponentes(id) ON DELETE CASCADE,
  
  -- Tipo de proponente
  tipo tipo_proponente NOT NULL,
  
  -- Dados comuns
  nome TEXT NOT NULL, -- Nome ou Razão Social
  nome_artistico TEXT,
  telefone TEXT,
  endereco TEXT,
  cep TEXT,
  cidade TEXT,
  estado TEXT,
  
  -- Dados PF específicos
  cpf TEXT UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  mini_curriculo TEXT,
  comunidade_tradicional TEXT,
  outra_comunidade TEXT,
  genero TEXT,
  raca TEXT,
  pcd BOOLEAN DEFAULT false,
  tipo_deficiencia TEXT,
  outra_deficiencia TEXT,
  escolaridade TEXT,
  renda_mensal TEXT,
  programa_social TEXT,
  outro_programa_social TEXT,
  concorre_cotas BOOLEAN DEFAULT false,
  tipo_cotas TEXT,
  funcao_artistica TEXT,
  outra_funcao_artistica TEXT,
  representa_coletivo BOOLEAN DEFAULT false,
  nome_coletivo TEXT,
  ano_coletivo TEXT,
  
  -- Dados PJ específicos
  cnpj TEXT UNIQUE,
  razao_social TEXT,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  nome_responsavel TEXT,
  cpf_responsavel TEXT,
  cargo_responsavel TEXT,
  
  -- Dados bancários
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT,
  pix TEXT,
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  aprovado BOOLEAN DEFAULT false, -- Prefeitura pode precisar aprovar proponentes
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Validação: CPF ou CNPJ deve estar preenchido
  CONSTRAINT cpf_ou_cnpj_obrigatorio CHECK (
    (tipo = 'PF' AND cpf IS NOT NULL) OR
    (tipo = 'PJ' AND cnpj IS NOT NULL) OR
    (tipo = 'Grupo' AND cpf IS NOT NULL) OR
    (tipo = 'COOP' AND cnpj IS NOT NULL)
  )
);

-- Índices para proponentes
CREATE INDEX idx_proponentes_prefeitura ON proponentes(prefeitura_id);
CREATE INDEX idx_proponentes_usuario ON proponentes(usuario_id);
CREATE INDEX idx_proponentes_cpf ON proponentes(cpf);
CREATE INDEX idx_proponentes_cnpj ON proponentes(cnpj);
CREATE INDEX idx_proponentes_tipo ON proponentes(tipo);

-- ============================================
-- 3. AJUSTAR REFERÊNCIAS EM OUTRAS TABELAS
-- ============================================

-- Nota: As tabelas projetos, etc. já têm proponente_id
-- Não precisam ser alteradas pois continuam referenciando proponentes(id)

-- ============================================
-- 4. TRIGGER PARA CRIPTOGRAFAR SENHA
-- ============================================

CREATE OR REPLACE FUNCTION criptografar_senha_usuario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.senha_hash IS NOT NULL AND NEW.senha_hash NOT LIKE '$2%' THEN
    NEW.senha_hash := crypt(NEW.senha_hash, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criptografar_senha_usuario
  BEFORE INSERT ON usuarios_proponentes
  FOR EACH ROW
  EXECUTE FUNCTION criptografar_senha_usuario();

-- ============================================
-- 5. FUNÇÕES PARA AUTENTICAÇÃO DE USUÁRIOS
-- ============================================

-- Função para verificar senha do usuário
CREATE OR REPLACE FUNCTION verificar_senha_usuario(
  p_email TEXT,
  p_senha TEXT
)
RETURNS TABLE (
  id UUID,
  prefeitura_id UUID,
  nome TEXT,
  email TEXT,
  ativo BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.prefeitura_id,
    u.nome,
    u.email,
    u.ativo
  FROM usuarios_proponentes u
  WHERE u.email = p_email
    AND u.senha_hash = crypt(p_senha, u.senha_hash)
    AND u.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar senha do usuário
CREATE OR REPLACE FUNCTION atualizar_senha_usuario(
  p_usuario_id UUID,
  p_nova_senha TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE usuarios_proponentes
  SET 
    senha_hash = crypt(p_nova_senha, gen_salt('bf', 10)),
    updated_at = now()
  WHERE id = p_usuario_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FUNÇÃO PARA BUSCAR PROPONENTES DO USUÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_proponentes_usuario(p_usuario_id UUID)
RETURNS TABLE (
  id UUID,
  tipo tipo_proponente,
  nome TEXT,
  cpf TEXT,
  cnpj TEXT,
  ativo BOOLEAN,
  aprovado BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.tipo,
    p.nome,
    p.cpf,
    p.cnpj,
    p.ativo,
    p.aprovado
  FROM proponentes p
  WHERE p.usuario_id = p_usuario_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. COMENTÁRIOS
-- ============================================

COMMENT ON TABLE usuarios_proponentes IS 'Usuários que acessam o sistema (credenciais de login)';
COMMENT ON TABLE proponentes IS 'Proponentes vinculados aos usuários (perfis jurídicos PF/PJ/Grupo/COOP)';
COMMENT ON COLUMN proponentes.usuario_id IS 'Usuário proprietário deste proponente';
COMMENT ON COLUMN proponentes.aprovado IS 'Se a prefeitura já aprovou este proponente para submeter projetos';

