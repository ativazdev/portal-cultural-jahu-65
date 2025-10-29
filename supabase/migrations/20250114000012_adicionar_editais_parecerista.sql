-- Adicionar coluna para vincular pareceristas aos editais
ALTER TABLE pareceristas 
ADD COLUMN editais_permitidos UUID[] DEFAULT '{}';

-- Comentário para documentar a coluna
COMMENT ON COLUMN pareceristas.editais_permitidos IS 'Lista de IDs dos editais que o parecerista pode acessar e avaliar';

-- Atualizar dados existentes (opcional - deixar vazio inicialmente)
UPDATE pareceristas 
SET editais_permitidos = '{}' 
WHERE editais_permitidos IS NULL;
