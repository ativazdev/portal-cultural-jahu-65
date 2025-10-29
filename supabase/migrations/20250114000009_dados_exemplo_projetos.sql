-- Inserir dados de exemplo para testar a funcionalidade de projetos
-- Primeiro, vamos inserir alguns pareceristas

-- Inserir pareceristas
INSERT INTO pareceristas (
  prefeitura_id,
  email,
  senha_hash,
  nome,
  cpf,
  rg,
  telefone,
  endereco,
  cidade,
  estado,
  cep,
  data_nascimento,
  area_atuacao,
  especialidade,
  experiencia_anos,
  formacao_academica,
  mini_curriculo,
  status
) VALUES 
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  'ana.costa@email.com',
  crypt('123456', gen_salt('bf')),
  'Ana Costa',
  '12345678901',
  '123456789',
  '(14) 99999-1111',
  'Rua das Flores, 123',
  'Jaú',
  'SP',
  '17200-000',
  '1985-03-15',
  'Música e Cultura Popular',
  ARRAY['musica', 'cultura_popular']::modalidade_cultural[],
  8,
  'Licenciatura em Música',
  'Especialista em música popular brasileira com 8 anos de experiência em projetos culturais.',
  'ativo'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  'carlos.lima@email.com',
  crypt('123456', gen_salt('bf')),
  'Carlos Lima',
  '12345678902',
  '123456790',
  '(14) 99999-2222',
  'Av. Paulista, 456',
  'Jaú',
  'SP',
  '17200-001',
  '1978-07-22',
  'Teatro e Artes Cênicas',
  ARRAY['teatro', 'circo']::modalidade_cultural[],
  12,
  'Mestrado em Artes Cênicas',
  'Diretor teatral e especialista em circo com mais de 12 anos de experiência.',
  'ativo'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  'lucia.mendes@email.com',
  crypt('123456', gen_salt('bf')),
  'Lucia Mendes',
  '12345678903',
  '123456791',
  '(14) 99999-3333',
  'Rua das Artes, 789',
  'Jaú',
  'SP',
  '17200-002',
  '1982-11-10',
  'Artes Visuais e Literatura',
  ARRAY['artes_visuais', 'literatura']::modalidade_cultural[],
  10,
  'Doutorado em Artes Visuais',
  'Curadora e crítica de arte com especialização em literatura e artes visuais.',
  'ativo'
);

-- Inserir alguns proponentes
INSERT INTO usuarios_proponentes (
  prefeitura_id,
  email,
  senha_hash,
  nome
) VALUES 
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  'joao.silva@email.com',
  crypt('123456', gen_salt('bf')),
  'João Silva'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  'maria.santos@email.com',
  crypt('123456', gen_salt('bf')),
  'Maria Santos'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  'pedro.costa@email.com',
  crypt('123456', gen_salt('bf')),
  'Pedro Costa'
);

-- Inserir perfis de proponentes
INSERT INTO proponentes (
  prefeitura_id,
  usuario_id,
  tipo,
  nome,
  telefone,
  endereco,
  cidade,
  estado,
  cep,
  cpf,
  mini_curriculo,
  ativo,
  aprovado,
  cnpj
) VALUES 
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM usuarios_proponentes WHERE email = 'joao.silva@email.com'),
  'PF',
  'João Silva',
  '(14) 99999-4444',
  'Rua dos Músicos, 100',
  'Jaú',
  'SP',
  '17200-100',
  '11122233344',
  'Músico popular com 15 anos de experiência em projetos culturais.',
  true,
  true,
  NULL
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM usuarios_proponentes WHERE email = 'maria.santos@email.com'),
  'PF',
  'Maria Santos',
  '(14) 99999-5555',
  'Av. do Teatro, 200',
  'Jaú',
  'SP',
  '17200-200',
  '22233344455',
  'Atriz e diretora teatral com formação em artes cênicas.',
  true,
  true,
  NULL
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM usuarios_proponentes WHERE email = 'pedro.costa@email.com'),
  'PJ',
  'Pedro Costa',
  '(14) 99999-6666',
  'Rua da Dança, 300',
  'Jaú',
  'SP',
  '17200-300',
  NULL,
  'Empresário cultural especializado em projetos de dança.',
  true,
  true,
  '12345678000199'
);

-- Inserir alguns projetos de exemplo
INSERT INTO projetos (
  prefeitura_id,
  edital_id,
  proponente_id,
  nome,
  modalidade,
  categoria,
  descricao,
  objetivos,
  valor_solicitado,
  status,
  data_submissao
) VALUES 
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM editais WHERE codigo = '1123' LIMIT 1),
  (SELECT id FROM proponentes WHERE cpf = '11122233344'),
  'Festival de Música Popular',
  'musica',
  'Música Popular',
  'Festival de música popular brasileira com apresentações de artistas locais e regionais.',
  'Promover a música popular brasileira, valorizar artistas locais e proporcionar entretenimento cultural à comunidade.',
  15000.00,
  'recebido',
  NOW()
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM editais WHERE codigo = '1123' LIMIT 1),
  (SELECT id FROM proponentes WHERE cpf = '22233344455'),
  'Teatro na Praça',
  'teatro',
  'Artes Cênicas',
  'Apresentação teatral em praça pública com peça de teatro infantil.',
  'Levar arte e cultura para espaços públicos, especialmente para crianças e famílias.',
  8500.00,
  'em_avaliacao',
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM editais WHERE codigo = '1123' LIMIT 1),
  (SELECT id FROM proponentes WHERE cpf = '33344455566'),
  'Oficina de Dança Contemporânea',
  'danca',
  'Dança',
  'Oficina de dança contemporânea para jovens e adultos.',
  'Desenvolver habilidades artísticas através da dança, promover saúde e bem-estar.',
  12000.00,
  'aprovado',
  NOW() - INTERVAL '2 days'
);

-- Atribuir pareceristas aos projetos em avaliação
UPDATE projetos 
SET parecerista_id = (SELECT id FROM pareceristas WHERE email = 'ana.costa@email.com')
WHERE nome = 'Teatro na Praça';

-- Atualizar contadores dos pareceristas
UPDATE pareceristas 
SET projetos_em_analise = 1 
WHERE email = 'ana.costa@email.com';

UPDATE pareceristas 
SET total_avaliacoes = 1 
WHERE email = 'carlos.lima@email.com';

-- Inserir alguns documentos de habilitação para o projeto aprovado
INSERT INTO documentos_habilitacao (
  projeto_id,
  nome,
  descricao,
  tipo,
  obrigatorio,
  status,
  data_solicitacao
) VALUES 
(
  (SELECT id FROM projetos WHERE nome = 'Oficina de Dança Contemporânea'),
  'CNPJ',
  'Cartão de CNPJ atualizado',
  'cnpj',
  true,
  'aprovado',
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id FROM projetos WHERE nome = 'Oficina de Dança Contemporânea'),
  'Atos Constitutivos',
  'Estatuto social ou contrato social',
  'atos_constitutivos',
  true,
  'aprovado',
  NOW() - INTERVAL '5 days'
);
