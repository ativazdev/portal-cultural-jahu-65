-- ============================================
-- ATUALIZAR FUNÇÕES PARA USAR auth.jwt() PARA JWTs CUSTOMIZADOS
-- ============================================
-- As funções foram atualizadas para usar auth.jwt() primeiro,
-- que funciona melhor com JWTs customizados enviados via header Authorization

CREATE OR REPLACE FUNCTION get_user_type()
RETURNS TEXT AS $$
BEGIN
  -- Tentar primeiro com auth.jwt() (funciona melhor com JWTs customizados)
  RETURN COALESCE(
    (auth.jwt() ->> 'user_type'),
    (current_setting('request.jwt.claims', true)::json ->> 'user_type'),
    NULL
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Tentar primeiro com auth.jwt() (funciona melhor com JWTs customizados)
  IF get_user_type() IS NOT NULL THEN
    RETURN COALESCE(
      (auth.jwt() ->> 'sub'),
      (current_setting('request.jwt.claims', true)::json ->> 'sub'),
      NULL
    );
  END IF;
  
  -- Caso contrário, usar auth.uid() (usuários da prefeitura)
  RETURN auth.uid()::text;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_prefeitura_id()
RETURNS UUID AS $$
DECLARE
  jwt_prefeitura_id UUID;
  user_prefeitura_id UUID;
BEGIN
  -- Tentar primeiro com auth.jwt() (funciona melhor com JWTs customizados)
  jwt_prefeitura_id := COALESCE(
    (auth.jwt() ->> 'prefeitura_id')::uuid,
    (current_setting('request.jwt.claims', true)::json ->> 'prefeitura_id')::uuid,
    NULL
  );
  
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

