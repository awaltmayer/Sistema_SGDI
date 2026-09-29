-- ==============================================================================
-- MIGRAÇÃO: ADICIONAR COLUNA CORES_COLUNAS NA TABELA USUÁRIOS
-- Permite persistir as cores personalizadas do quadro Kanban conectadas ao usuário
-- Data: 2026-09-29
-- ==============================================================================

-- 1. Adicionar coluna cores_colunas caso não exista
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS cores_colunas JSONB DEFAULT '{}'::jsonb;

-- 2. Comentário explicativo na coluna
COMMENT ON COLUMN public.usuarios.cores_colunas IS 'Configurações de cores personalizadas das colunas do quadro Kanban por usuário';
