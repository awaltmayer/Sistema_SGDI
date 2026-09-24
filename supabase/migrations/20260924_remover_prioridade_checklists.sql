-- ====================================================================
-- MIGRAÇÃO: REMOVER COLUNA PRIORIDADE DA TABELA CHECKLISTS
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- ====================================================================

-- 1. Remove a coluna 'prioridade' da tabela checklists se ela existir
ALTER TABLE public.checklists DROP COLUMN IF EXISTS prioridade;
