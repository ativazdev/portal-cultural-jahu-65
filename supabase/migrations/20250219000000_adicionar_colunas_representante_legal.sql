-- ============================================
-- ADICIONAR COLUNAS DO REPRESENTANTE LEGAL
-- ============================================
-- Esta migration adiciona todas as colunas necessárias para o cadastro completo
-- do representante legal de Pessoa Jurídica, incluindo todos os campos que existem
-- no cadastro de Pessoa Física

-- Adicionar colunas do representante legal que estão faltando
ALTER TABLE proponentes
  -- Dados básicos adicionais
  ADD COLUMN IF NOT EXISTS rg_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS data_nascimento_responsavel DATE,
  ADD COLUMN IF NOT EXISTS email_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS telefone_responsavel TEXT,
  
  -- Endereço do representante
  ADD COLUMN IF NOT EXISTS cep_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS endereco_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS numero_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS complemento_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS cidade_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS estado_responsavel TEXT,
  
  -- Dados pessoais do representante
  ADD COLUMN IF NOT EXISTS comunidade_tradicional_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outra_comunidade_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS genero_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS raca_responsavel TEXT,
  
  -- Formação e renda do representante
  ADD COLUMN IF NOT EXISTS renda_mensal_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS programa_social_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outro_programa_social_responsavel TEXT,
  
  -- Cotas do representante
  ADD COLUMN IF NOT EXISTS concorre_cotas_responsavel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_cotas_responsavel TEXT,
  
  -- Atividade artística do representante
  ADD COLUMN IF NOT EXISTS funcao_artistica_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS outra_funcao_artistica_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS profissao_responsavel TEXT,
  ADD COLUMN IF NOT EXISTS mini_curriculo_responsavel TEXT;

-- Renomear colunas antigas para manter consistência (se existirem)
-- Nota: Verificamos se as colunas existem antes de renomear para evitar erros
DO $$
BEGIN
  -- Renomear email_representante para email_responsavel se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'email_representante'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'email_responsavel'
  ) THEN
    ALTER TABLE proponentes RENAME COLUMN email_representante TO email_responsavel;
  END IF;
  
  -- Renomear telefone_representante para telefone_responsavel se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'telefone_representante'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'telefone_responsavel'
  ) THEN
    ALTER TABLE proponentes RENAME COLUMN telefone_representante TO telefone_responsavel;
  END IF;
  
  -- Renomear genero_representante para genero_responsavel se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'genero_representante'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'genero_responsavel'
  ) THEN
    ALTER TABLE proponentes RENAME COLUMN genero_representante TO genero_responsavel;
  END IF;
  
  -- Renomear raca_representante para raca_responsavel se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'raca_representante'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proponentes' AND column_name = 'raca_responsavel'
  ) THEN
    ALTER TABLE proponentes RENAME COLUMN raca_representante TO raca_responsavel;
  END IF;
END $$;

-- Adicionar campos adicionais para PF que podem estar faltando
ALTER TABLE proponentes
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS complemento TEXT,
  ADD COLUMN IF NOT EXISTS profissao TEXT;

-- Comentários para documentação
COMMENT ON COLUMN proponentes.rg_responsavel IS 'RG do representante legal da Pessoa Jurídica';
COMMENT ON COLUMN proponentes.data_nascimento_responsavel IS 'Data de nascimento do representante legal';
COMMENT ON COLUMN proponentes.email_responsavel IS 'Email do representante legal';
COMMENT ON COLUMN proponentes.telefone_responsavel IS 'Telefone do representante legal';
COMMENT ON COLUMN proponentes.cep_responsavel IS 'CEP do endereço do representante legal';
COMMENT ON COLUMN proponentes.endereco_responsavel IS 'Logradouro do endereço do representante legal';
COMMENT ON COLUMN proponentes.numero_responsavel IS 'Número do endereço do representante legal';
COMMENT ON COLUMN proponentes.complemento_responsavel IS 'Complemento do endereço do representante legal';
COMMENT ON COLUMN proponentes.cidade_responsavel IS 'Cidade do endereço do representante legal';
COMMENT ON COLUMN proponentes.estado_responsavel IS 'Estado do endereço do representante legal';
COMMENT ON COLUMN proponentes.comunidade_tradicional_responsavel IS 'Comunidade tradicional do representante legal';
COMMENT ON COLUMN proponentes.outra_comunidade_responsavel IS 'Outra comunidade tradicional do representante legal (se aplicável)';
COMMENT ON COLUMN proponentes.genero_responsavel IS 'Identidade de gênero do representante legal';
COMMENT ON COLUMN proponentes.raca_responsavel IS 'Raça, cor ou etnia do representante legal';
COMMENT ON COLUMN proponentes.renda_mensal_responsavel IS 'Renda mensal do representante legal';
COMMENT ON COLUMN proponentes.programa_social_responsavel IS 'Programa social do representante legal';
COMMENT ON COLUMN proponentes.outro_programa_social_responsavel IS 'Outro programa social do representante legal (se aplicável)';
COMMENT ON COLUMN proponentes.concorre_cotas_responsavel IS 'Se o representante legal concorre a cotas';
COMMENT ON COLUMN proponentes.tipo_cotas_responsavel IS 'Tipo de cotas do representante legal';
COMMENT ON COLUMN proponentes.funcao_artistica_responsavel IS 'Função artística do representante legal';
COMMENT ON COLUMN proponentes.outra_funcao_artistica_responsavel IS 'Outra função artística do representante legal (se aplicável)';
COMMENT ON COLUMN proponentes.profissao_responsavel IS 'Profissão do representante legal';
COMMENT ON COLUMN proponentes.mini_curriculo_responsavel IS 'Mini currículo do representante legal';

