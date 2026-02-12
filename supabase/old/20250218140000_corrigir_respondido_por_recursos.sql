-- Corrigir referência de respondido_por na tabela recursos
-- A tabela deve referenciar user_profiles ao invés de profiles

-- Remover constraint antiga se existir
ALTER TABLE recursos 
DROP CONSTRAINT IF EXISTS recursos_respondido_por_fkey;

-- Adicionar nova constraint referenciando user_profiles
ALTER TABLE recursos 
ADD CONSTRAINT recursos_respondido_por_fkey 
FOREIGN KEY (respondido_por) 
REFERENCES user_profiles(id) 
ON DELETE SET NULL;

