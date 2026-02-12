-- Adicionar novo status 'aguardando_avaliacao' ao enum status_projeto
ALTER TYPE status_projeto ADD VALUE 'aguardando_avaliacao' BEFORE 'em_avaliacao';

-- Comentário explicativo
COMMENT ON TYPE status_projeto IS 'Status dos projetos no sistema PNAB. Ordem: recebido -> aguardando_avaliacao -> em_avaliacao -> avaliado -> aprovado/rejeitado -> em_execucao -> concluido';
