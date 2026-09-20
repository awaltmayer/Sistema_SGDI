-- =====================================================================
-- Migração: Vínculo de Solicitante na Tabela de Demandas (cartoes)
-- Módulo: Gestão de Demandas de TI (SGDI)
-- Arquitetura: Rastreabilidade e Integridade Referencial com perfis/auth
-- =====================================================================

-- 1. Adicionar a coluna id_solicitante na tabela cartoes referenciando perfis(id)
ALTER TABLE public.cartoes
ADD COLUMN IF NOT EXISTS id_solicitante UUID REFERENCES public.perfis(id) ON DELETE SET NULL;

-- 2. Migrar dados legados:
-- Garante que todas as demandas antigas fiquem vinculadas ao id_usuario que as criou
UPDATE public.cartoes
SET id_solicitante = id_usuario::uuid
WHERE id_solicitante IS NULL AND id_usuario IS NOT NULL;

-- 3. Criar índice para otimização de consultas e relatórios por solicitante
CREATE INDEX IF NOT EXISTS idx_cartoes_id_solicitante
ON public.cartoes (id_solicitante);

-- 4. Criar índice complementar para integridade e busca por id_usuario
CREATE INDEX IF NOT EXISTS idx_cartoes_id_usuario
ON public.cartoes (id_usuario);

-- 5. Comentários para documentação do catálogo de banco de dados
COMMENT ON COLUMN public.cartoes.id_solicitante IS 'Identificador único (UUID) do usuário solicitante da demanda (FK perfis.id)';
COMMENT ON INDEX public.idx_cartoes_id_solicitante IS 'Índice de performance para filtros, agregações e relatórios por solicitante';
