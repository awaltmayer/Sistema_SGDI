-- ==============================================================================
-- MIGRAÇÃO SUPABASE: Remover coluna id_responsavel e manter apenas ids_responsaveis
-- Data: 2026-09-24
-- Descrição:
-- 1. Garante que a coluna ids_responsaveis (text[]) exista na tabela cartoes.
-- 2. Migra com segurança os responsáveis antigos de id_responsavel para ids_responsaveis.
-- 3. Remove a chave estrangeira (foreign key) associada a id_responsavel.
-- 4. Remove a coluna id_responsavel.
-- 5. Cria índice GIN para buscas ultra-rápidas por responsável dentro do array.
-- ==============================================================================

-- 1. Adiciona a coluna ids_responsaveis caso ainda não exista
ALTER TABLE cartoes
  ADD COLUMN IF NOT EXISTS ids_responsaveis text[] DEFAULT '{}';

-- 2. Migra quaisquer dados existentes em id_responsavel para o array ids_responsaveis
UPDATE cartoes
SET ids_responsaveis = ARRAY[id_responsavel::text]
WHERE id_responsavel IS NOT NULL
  AND (ids_responsaveis IS NULL OR cardinality(ids_responsaveis) = 0);

-- 3. Garante que não haja valores nulos no array
UPDATE cartoes
SET ids_responsaveis = '{}'
WHERE ids_responsaveis IS NULL;

ALTER TABLE cartoes
  ALTER COLUMN ids_responsaveis SET DEFAULT '{}';

-- 4. Remove constraints e chave estrangeira de id_responsavel (se houver)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'cartoes' AND column_name = 'id_responsavel'
    ) LOOP
        EXECUTE 'ALTER TABLE cartoes DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
    END LOOP;
END $$;

-- 5. Remove a coluna legada id_responsavel
ALTER TABLE cartoes
  DROP COLUMN IF EXISTS id_responsavel;

-- 6. Cria índice GIN para performance otimizada em filtros por responsável
CREATE INDEX IF NOT EXISTS idx_cartoes_ids_responsaveis
  ON cartoes USING GIN (ids_responsaveis);

-- 7. Documentação da coluna
COMMENT ON COLUMN cartoes.ids_responsaveis IS 'Lista de IDs dos membros da equipe atribuídos como responsáveis pela tarefa';
