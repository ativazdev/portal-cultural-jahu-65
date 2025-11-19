-- Remover constraint única de parecerista por projeto para permitir múltiplos pareceristas
-- Manter constraint mas permitir múltiplos pareceristas diferentes

-- Remover constraint antiga se existir
ALTER TABLE avaliacoes 
DROP CONSTRAINT IF EXISTS unique_avaliacao;

-- Criar nova constraint que permite múltiplos pareceristas mas não duplicatas
-- Um parecerista não pode avaliar o mesmo projeto duas vezes
ALTER TABLE avaliacoes
ADD CONSTRAINT unique_avaliacao_parecerista_projeto 
UNIQUE (projeto_id, parecerista_id);

-- Comentário explicativo
COMMENT ON CONSTRAINT unique_avaliacao_parecerista_projeto ON avaliacoes IS 
'Permite múltiplos pareceristas por projeto, mas evita que o mesmo parecerista avalie o mesmo projeto duas vezes';

