-- Remover tabela profiles se existir
DROP TABLE IF EXISTS profiles CASCADE;

-- Criar tabela user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prefeitura_id UUID REFERENCES prefeituras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_prefeitura_id ON user_profiles(prefeitura_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inserir dados de exemplo (comentado - descomente após criar usuário no Supabase Auth)
-- INSERT INTO user_profiles (user_id, prefeitura_id, nome, cargo, telefone) 
-- VALUES (
--   'USER_ID_AQUI', -- Substitua pelo ID do usuário criado no Supabase Auth
--   (SELECT id FROM prefeituras WHERE nome = 'Prefeitura de Jau'), 
--   'Administrador', 
--   'Secretário de Cultura', 
--   '(14) 99999-9999'
-- );
