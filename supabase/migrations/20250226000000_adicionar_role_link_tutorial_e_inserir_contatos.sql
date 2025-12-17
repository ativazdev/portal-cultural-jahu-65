-- ============================================
-- ADICIONAR COLUNAS ROLE E LINK_TUTORIAL E INSERIR CONTATOS POR ROLE
-- ============================================

-- Adicionar coluna role se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contato_suporte' AND column_name = 'role'
  ) THEN
    ALTER TABLE contato_suporte ADD COLUMN role TEXT;
    CREATE INDEX IF NOT EXISTS idx_contato_suporte_role ON contato_suporte(role);
  END IF;
END $$;

-- Adicionar coluna link_tutorial se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contato_suporte' AND column_name = 'link_tutorial'
  ) THEN
    ALTER TABLE contato_suporte ADD COLUMN link_tutorial TEXT;
  END IF;
END $$;

-- Inserir contatos para cada role (apenas se não existirem)
-- Role: prefeitura
INSERT INTO contato_suporte (role, whatsapp, email, telefone, observacoes, ativo, link_tutorial)
SELECT 
  'prefeitura',
  NULL, -- Preencher com o WhatsApp da prefeitura
  NULL, -- Preencher com o email da prefeitura
  NULL, -- Preencher com o telefone da prefeitura
  'Horário de atendimento: Segunda a Sexta, das 9:00 às 16:45',
  true,
  NULL -- Preencher com o link do tutorial para prefeitura
WHERE NOT EXISTS (
  SELECT 1 FROM contato_suporte WHERE role = 'prefeitura'
);

-- Role: proponente
INSERT INTO contato_suporte (role, whatsapp, email, telefone, observacoes, ativo, link_tutorial)
SELECT 
  'proponente',
  NULL, -- Preencher com o WhatsApp para proponentes
  NULL, -- Preencher com o email para proponentes
  NULL, -- Preencher com o telefone para proponentes
  'Horário de atendimento: Segunda a Sexta, das 9:00 às 16:45',
  true,
  NULL -- Preencher com o link do tutorial para proponentes
WHERE NOT EXISTS (
  SELECT 1 FROM contato_suporte WHERE role = 'proponente'
);

-- Role: parecerista
INSERT INTO contato_suporte (role, whatsapp, email, telefone, observacoes, ativo, link_tutorial)
SELECT 
  'parecerista',
  NULL, -- Preencher com o WhatsApp para pareceristas
  NULL, -- Preencher com o email para pareceristas
  NULL, -- Preencher com o telefone para pareceristas
  'Horário de atendimento: Segunda a Sexta, das 9:00 às 16:45',
  true,
  NULL -- Preencher com o link do tutorial para pareceristas
WHERE NOT EXISTS (
  SELECT 1 FROM contato_suporte WHERE role = 'parecerista'
);

