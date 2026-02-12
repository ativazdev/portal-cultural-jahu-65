-- Criar tabela de prefeituras
CREATE TABLE IF NOT EXISTS prefeituras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela user_profiles será criada em migração separada

-- Criar tabela de pareceristas
CREATE TABLE IF NOT EXISTS pareceristas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  area_atuacao TEXT NOT NULL,
  especialidade TEXT[] DEFAULT '{}',
  experiencia_anos INTEGER NOT NULL,
  formacao_academica TEXT NOT NULL,
  mini_curriculo TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  data_ativacao TIMESTAMP WITH TIME ZONE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  editais_permitidos TEXT[] DEFAULT '{}'
);

-- Criar tabela de editais
CREATE TABLE IF NOT EXISTS editais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_abertura DATE NOT NULL,
  data_final_envio_projeto DATE NOT NULL,
  horario_final_envio_projeto TIME NOT NULL,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aberto', 'fechado', 'arquivado')),
  total_projetos INTEGER DEFAULT 0,
  valor_maximo NUMERIC NOT NULL,
  prazo_avaliacao INTEGER NOT NULL,
  modalidades TEXT[] DEFAULT '{}',
  regulamento TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Criar tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prefeitura_id UUID REFERENCES prefeituras(id) ON DELETE CASCADE,
  edital_id UUID REFERENCES editais(id) ON DELETE CASCADE,
  proponente_id UUID NOT NULL, -- Referência para tabela de proponentes
  nome TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  descricao TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  perfil_publico TEXT NOT NULL,
  publico_prioritario TEXT[] DEFAULT '{}',
  outro_publico_prioritario TEXT,
  acessibilidade_arquitetonica TEXT[] DEFAULT '{}',
  outra_acessibilidade_arquitetonica TEXT,
  acessibilidade_comunicacional TEXT[] DEFAULT '{}',
  outra_acessibilidade_comunicacional TEXT,
  acessibilidade_atitudinal TEXT[] DEFAULT '{}',
  implementacao_acessibilidade TEXT,
  local_execucao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_final DATE NOT NULL,
  estrategia_divulgacao TEXT NOT NULL,
  valor_solicitado NUMERIC NOT NULL,
  outras_fontes BOOLEAN DEFAULT FALSE,
  tipos_outras_fontes TEXT[] DEFAULT '{}',
  detalhes_outras_fontes TEXT,
  venda_produtos BOOLEAN DEFAULT FALSE,
  detalhes_venda_produtos TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'submetido', 'em_avaliacao', 'aprovado', 'rejeitado', 'arquivado')),
  data_submissao TIMESTAMP WITH TIME ZONE,
  necessita_comprovante_residencia BOOLEAN DEFAULT FALSE,
  numero_inscricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valor_maximo_projeto NUMERIC
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pareceristas_prefeitura_id ON pareceristas(prefeitura_id);
CREATE INDEX IF NOT EXISTS idx_editais_prefeitura_id ON editais(prefeitura_id);
CREATE INDEX IF NOT EXISTS idx_projetos_prefeitura_id ON projetos(prefeitura_id);
CREATE INDEX IF NOT EXISTS idx_projetos_edital_id ON projetos(edital_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE prefeituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareceristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prefeituras
CREATE POLICY "Users can view their prefeitura" ON prefeituras
  FOR SELECT USING (
    id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para pareceristas
CREATE POLICY "Users can view pareceristas from their prefeitura" ON pareceristas
  FOR SELECT USING (
    prefeitura_id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage pareceristas from their prefeitura" ON pareceristas
  FOR ALL USING (
    prefeitura_id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para editais
CREATE POLICY "Users can view editais from their prefeitura" ON editais
  FOR SELECT USING (
    prefeitura_id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage editais from their prefeitura" ON editais
  FOR ALL USING (
    prefeitura_id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas RLS para projetos
CREATE POLICY "Users can view projetos from their prefeitura" ON projetos
  FOR SELECT USING (
    prefeitura_id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage projetos from their prefeitura" ON projetos
  FOR ALL USING (
    prefeitura_id IN (
      SELECT prefeitura_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Inserir dados de exemplo
INSERT INTO prefeituras (nome, cnpj, endereco, cidade, estado, cep, telefone, email) VALUES
('Prefeitura de Jau', '12.345.678/0001-90', 'Rua da Prefeitura, 123', 'Jau', 'SP', '17201-000', '(14) 3622-0000', 'contato@jau.sp.gov.br');

-- Criar usuário de teste (você precisará criar este usuário no Supabase Auth primeiro)
-- INSERT INTO user_profiles (user_id, prefeitura_id, nome, cargo, telefone) VALUES
-- ('user-uuid-here', (SELECT id FROM prefeituras WHERE nome = 'Prefeitura de Jau'), 'Administrador', 'Secretário de Cultura', '(14) 99999-9999');
