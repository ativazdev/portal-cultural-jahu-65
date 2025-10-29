-- ============================================
-- FUNÇÕES PARA GERENCIAMENTO DE SENHAS
-- ============================================

-- Função para atualizar senha de parecerista
CREATE OR REPLACE FUNCTION atualizar_senha_parecerista(p_id UUID, p_senha TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE pareceristas
  SET senha_hash = crypt(p_senha, gen_salt('bf'))
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar senha de parecerista
CREATE OR REPLACE FUNCTION verificar_senha_parecerista(p_id UUID, p_senha TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_senha_hash TEXT;
BEGIN
  SELECT senha_hash INTO v_senha_hash
  FROM pareceristas
  WHERE id = p_id;
  
  IF v_senha_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_senha_hash = crypt(p_senha, v_senha_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar senha de proponente
CREATE OR REPLACE FUNCTION atualizar_senha_proponente(p_id UUID, p_senha TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE proponentes
  SET senha_hash = crypt(p_senha, gen_salt('bf'))
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar senha de proponente
CREATE OR REPLACE FUNCTION verificar_senha_proponente(p_id UUID, p_senha TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_senha_hash TEXT;
BEGIN
  SELECT senha_hash INTO v_senha_hash
  FROM proponentes
  WHERE id = p_id;
  
  IF v_senha_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_senha_hash = crypt(p_senha, v_senha_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS PARA CRIPTOGRAFAR SENHAS AUTOMATICAMENTE
-- ============================================

-- Trigger para criptografar senha ao inserir parecerista
CREATE OR REPLACE FUNCTION trigger_criptografar_senha_parecerista()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a senha não estiver já criptografada (não começa com $2), criptografar
  IF NEW.senha_hash NOT LIKE '$2%' THEN
    NEW.senha_hash := crypt(NEW.senha_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_parecerista_criptografar_senha
BEFORE INSERT ON pareceristas
FOR EACH ROW
EXECUTE FUNCTION trigger_criptografar_senha_parecerista();

-- Trigger para criptografar senha ao inserir proponente
CREATE OR REPLACE FUNCTION trigger_criptografar_senha_proponente()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a senha não estiver já criptografada (não começa com $2), criptografar
  IF NEW.senha_hash NOT LIKE '$2%' THEN
    NEW.senha_hash := crypt(NEW.senha_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_proponente_criptografar_senha
BEFORE INSERT ON proponentes
FOR EACH ROW
EXECUTE FUNCTION trigger_criptografar_senha_proponente();

-- ============================================
-- FUNÇÕES AUXILIARES PARA RECUPERAÇÃO DE SENHA
-- ============================================

-- Tabela para tokens de recuperação de senha (pareceristas)
CREATE TABLE recuperacao_senha_parecerista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parecerista_id UUID NOT NULL REFERENCES pareceristas(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT false,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para tokens de recuperação de senha (proponentes)
CREATE TABLE recuperacao_senha_proponente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proponente_id UUID NOT NULL REFERENCES proponentes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT false,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_recuperacao_parecerista_token ON recuperacao_senha_parecerista(token);
CREATE INDEX idx_recuperacao_proponente_token ON recuperacao_senha_proponente(token);

-- Habilitar RLS
ALTER TABLE recuperacao_senha_parecerista ENABLE ROW LEVEL SECURITY;
ALTER TABLE recuperacao_senha_proponente ENABLE ROW LEVEL SECURITY;

-- Políticas (somente uso interno via funções)
CREATE POLICY "Acesso interno a recuperação parecerista"
ON recuperacao_senha_parecerista FOR ALL
USING (true);

CREATE POLICY "Acesso interno a recuperação proponente"
ON recuperacao_senha_proponente FOR ALL
USING (true);

-- Função para gerar token de recuperação de senha (parecerista)
CREATE OR REPLACE FUNCTION gerar_token_recuperacao_parecerista(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_parecerista_id UUID;
  v_token TEXT;
BEGIN
  -- Buscar parecerista por email
  SELECT id INTO v_parecerista_id
  FROM pareceristas
  WHERE email = p_email AND status = 'ativo';
  
  IF v_parecerista_id IS NULL THEN
    RAISE EXCEPTION 'Email não encontrado';
  END IF;
  
  -- Gerar token aleatório
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Inserir token
  INSERT INTO recuperacao_senha_parecerista (parecerista_id, token, expira_em)
  VALUES (v_parecerista_id, v_token, now() + interval '1 hour');
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar token de recuperação de senha (proponente)
CREATE OR REPLACE FUNCTION gerar_token_recuperacao_proponente(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_proponente_id UUID;
  v_token TEXT;
BEGIN
  -- Buscar proponente por email
  SELECT id INTO v_proponente_id
  FROM proponentes
  WHERE email = p_email AND status = 'ativo';
  
  IF v_proponente_id IS NULL THEN
    RAISE EXCEPTION 'Email não encontrado';
  END IF;
  
  -- Gerar token aleatório
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Inserir token
  INSERT INTO recuperacao_senha_proponente (proponente_id, token, expira_em)
  VALUES (v_proponente_id, v_token, now() + interval '1 hour');
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para redefinir senha usando token (parecerista)
CREATE OR REPLACE FUNCTION redefinir_senha_parecerista(p_token TEXT, p_nova_senha TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_recuperacao RECORD;
BEGIN
  -- Buscar token válido
  SELECT * INTO v_recuperacao
  FROM recuperacao_senha_parecerista
  WHERE token = p_token
    AND usado = false
    AND expira_em > now();
  
  IF v_recuperacao IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar senha
  UPDATE pareceristas
  SET senha_hash = crypt(p_nova_senha, gen_salt('bf'))
  WHERE id = v_recuperacao.parecerista_id;
  
  -- Marcar token como usado
  UPDATE recuperacao_senha_parecerista
  SET usado = true
  WHERE id = v_recuperacao.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para redefinir senha usando token (proponente)
CREATE OR REPLACE FUNCTION redefinir_senha_proponente(p_token TEXT, p_nova_senha TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_recuperacao RECORD;
BEGIN
  -- Buscar token válido
  SELECT * INTO v_recuperacao
  FROM recuperacao_senha_proponente
  WHERE token = p_token
    AND usado = false
    AND expira_em > now();
  
  IF v_recuperacao IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar senha
  UPDATE proponentes
  SET senha_hash = crypt(p_nova_senha, gen_salt('bf'))
  WHERE id = v_recuperacao.proponente_id;
  
  -- Marcar token como usado
  UPDATE recuperacao_senha_proponente
  SET usado = true
  WHERE id = v_recuperacao.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

