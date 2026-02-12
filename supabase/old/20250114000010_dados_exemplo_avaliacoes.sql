-- Inserir dados de exemplo para testar a funcionalidade de avaliações

-- Inserir avaliações de exemplo
INSERT INTO avaliacoes (
  prefeitura_id,
  projeto_id,
  parecerista_id,
  nota_relevancia,
  nota_viabilidade,
  nota_impacto,
  nota_orcamento,
  nota_inovacao,
  nota_sustentabilidade,
  nota_final,
  parecer_tecnico,
  recomendacao,
  status,
  data_avaliacao
) VALUES 
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM projetos WHERE nome = 'Festival de Música Popular' LIMIT 1),
  (SELECT id FROM pareceristas WHERE email = 'ana.costa@email.com' LIMIT 1),
  8.5,
  7.0,
  9.0,
  6.5,
  4.0,
  3.5,
  59.5,
  'Projeto com excelente potencial de impacto cultural na comunidade local. A proposta está bem estruturada e demonstra conhecimento técnico adequado.',
  'aprovacao',
  'em_analise',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM projetos WHERE nome = 'Teatro na Praça' LIMIT 1),
  (SELECT id FROM pareceristas WHERE email = 'carlos.lima@email.com' LIMIT 1),
  7.5,
  8.0,
  7.0,
  7.5,
  3.0,
  2.5,
  50.4,
  'Proposta bem estruturada com cronograma realista. O projeto tem potencial para engajar a comunidade local.',
  'aprovacao',
  'aprovado',
  NOW() - INTERVAL '3 days'
),
(
  (SELECT id FROM prefeituras WHERE municipio = 'Jaú' LIMIT 1),
  (SELECT id FROM projetos WHERE nome = 'Oficina de Dança Contemporânea' LIMIT 1),
  (SELECT id FROM pareceristas WHERE email = 'lucia.mendes@email.com' LIMIT 1),
  9.0,
  8.5,
  9.5,
  8.0,
  5.0,
  4.5,
  63.7,
  'Excelente projeto com alto potencial de transformação social. A metodologia proposta é inovadora e bem fundamentada.',
  'aprovacao',
  'aprovado',
  NOW() - INTERVAL '5 days'
);
