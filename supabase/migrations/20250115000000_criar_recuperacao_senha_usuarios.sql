-- ============================================
-- RECUPERAÇÃO DE SENHA PARA USUARIOS_PROPONENTES
-- ============================================

-- Tabela para tokens de recuperação de senha (usuarios_proponentes)
CREATE TABLE IF NOT EXISTS recuperacao_senha_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios_proponentes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT false,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recuperacao_usuario_token ON recuperacao_senha_usuario(token);
CREATE INDEX IF NOT EXISTS idx_recuperacao_usuario_usuario_id ON recuperacao_senha_usuario(usuario_id);

-- Habilitar RLS
ALTER TABLE recuperacao_senha_usuario ENABLE ROW LEVEL SECURITY;

-- Política (somente uso interno via funções)
DROP POLICY IF EXISTS "Acesso interno a recuperação usuario" ON recuperacao_senha_usuario;
CREATE POLICY "Acesso interno a recuperação usuario"
ON recuperacao_senha_usuario FOR ALL
USING (true);

-- Função para gerar token de recuperação de senha (usuario)
CREATE OR REPLACE FUNCTION gerar_token_recuperacao_usuario(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
  v_usuario_id UUID;
  v_token TEXT;
BEGIN
  -- Buscar usuario por email
  SELECT id INTO v_usuario_id
  FROM usuarios_proponentes
  WHERE email = LOWER(p_email) AND ativo = true;
  
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Email não encontrado';
  END IF;
  
  -- Gerar token aleatório
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Inserir token
  INSERT INTO recuperacao_senha_usuario (usuario_id, token, expira_em)
  VALUES (v_usuario_id, v_token, now() + interval '1 hour');
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para redefinir senha usando token (usuario)
CREATE OR REPLACE FUNCTION redefinir_senha_usuario(p_token TEXT, p_nova_senha TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_recuperacao RECORD;
BEGIN
  -- Buscar token válido
  SELECT * INTO v_recuperacao
  FROM recuperacao_senha_usuario
  WHERE token = p_token
    AND usado = false
    AND expira_em > now();
  
  IF v_recuperacao IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar senha
  UPDATE usuarios_proponentes
  SET 
    senha_hash = crypt(p_nova_senha, gen_salt('bf')),
    updated_at = now()
  WHERE id = v_recuperacao.usuario_id;
  
  -- Marcar token como usado
  UPDATE recuperacao_senha_usuario
  SET usado = true
  WHERE id = v_recuperacao.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

