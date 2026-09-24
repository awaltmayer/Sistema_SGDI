-- ==============================================================================
-- Migração: Suporte a múltiplos responsáveis por cartão/tarefa
-- Adiciona a coluna ids_responsaveis como array de texto na tabela cartoes
-- ==============================================================================

-- 1. Adicionar coluna ids_responsaveis se não existir
ALTER TABLE public.cartoes
ADD COLUMN IF NOT EXISTS ids_responsaveis text[] DEFAULT '{}'::text[];

-- 2. Migrar dados existentes: preencher ids_responsaveis com id_responsavel
UPDATE public.cartoes
SET ids_responsaveis = ARRAY[id_responsavel::text]
WHERE id_responsavel IS NOT NULL
  AND (ids_responsaveis IS NULL OR array_length(ids_responsaveis, 1) IS NULL);

-- 3. Criar índice GIN para buscas eficientes por responsável
CREATE INDEX IF NOT EXISTS idx_cartoes_ids_responsaveis 
ON public.cartoes USING GIN (ids_responsaveis);

-- Notificação de conclusão
COMMENT ON COLUMN public.cartoes.ids_responsaveis IS 'IDs de todos os membros responsáveis por esta tarefa';
