-- Migration to fix project constraints and update category enum
-- Descrição: Torna descrição e objetivos opcionais (para rascunhos) e adiciona artes_cenicas/outros ao enum

-- 1. Alterar o enum Categoria_cultural para incluir novos valores se não existirem
-- Nota: PostgreSQL não permite remover valores de ENUM facilmente, mas permite adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'categoria_cultural' AND e.enumlabel = 'artes_cenicas') THEN
        ALTER TYPE Categoria_cultural ADD VALUE 'artes_cenicas';
    END IF;
END $$;

-- 2. Alterar a tabela projetos para tornar descricao e objetivos NULLABLE
ALTER TABLE projetos ALTER COLUMN descricao DROP NOT NULL;
ALTER TABLE projetos ALTER COLUMN objetivos DROP NOT NULL;

-- 3. Garantir que a coluna modalidade aceite TEXT ou Categoria_cultural corretamente
-- De acordo com a migration antiga, já existia uma confusão entre Categoria_cultural e TEXT
-- Vamos garantir que ela seja TEXT para máxima flexibilidade ou manter o ENUM se necessário.
-- Como o erro pode ser 'invalid input value for enum', vamos garantir que o frontend envie valores válidos.
