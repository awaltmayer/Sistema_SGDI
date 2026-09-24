-- ====================================================================
-- MIGRAÇÃO DE TABELAS DE CHECKLISTS E ITENS DE CHECKLIST NO SUPABASE
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- ====================================================================

-- 1. Criação condicional das tabelas de acordo com o tipo de ID da tabela cartoes (UUID ou BIGINT)
DO $$
DECLARE
    v_cartao_id_type text;
BEGIN
    SELECT data_type INTO v_cartao_id_type
    FROM information_schema.columns
    WHERE table_name = 'cartoes' AND column_name = 'id';

    IF v_cartao_id_type = 'bigint' OR v_cartao_id_type = 'integer' THEN
        -- Caso IDs sejam numéricos
        CREATE TABLE IF NOT EXISTS public.checklists (
            id BIGSERIAL PRIMARY KEY,
            id_usuario UUID,
            id_cartao BIGINT NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            prioridade TEXT NOT NULL DEFAULT 'medium',
            posicao INTEGER NOT NULL DEFAULT 0,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS public.itens_checklist (
            id BIGSERIAL PRIMARY KEY,
            id_checklist BIGINT NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            esta_concluido BOOLEAN NOT NULL DEFAULT false,
            posicao INTEGER NOT NULL DEFAULT 0,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    ELSE
        -- Caso IDs sejam UUID (padrão Supabase)
        CREATE TABLE IF NOT EXISTS public.checklists (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            id_usuario UUID,
            id_cartao UUID NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            prioridade TEXT NOT NULL DEFAULT 'medium',
            posicao INTEGER NOT NULL DEFAULT 0,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS public.itens_checklist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            id_checklist UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            esta_concluido BOOLEAN NOT NULL DEFAULT false,
            posicao INTEGER NOT NULL DEFAULT 0,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_checklist ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso RLS para Checklists
DROP POLICY IF EXISTS "Permitir leitura checklists para todos" ON public.checklists;
CREATE POLICY "Permitir leitura checklists para todos" ON public.checklists FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao checklists para autenticados" ON public.checklists;
CREATE POLICY "Permitir insercao checklists para autenticados" ON public.checklists FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao checklists para autenticados" ON public.checklists;
CREATE POLICY "Permitir atualizacao checklists para autenticados" ON public.checklists FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao checklists para autenticados" ON public.checklists;
CREATE POLICY "Permitir exclusao checklists para autenticados" ON public.checklists FOR DELETE USING (true);

-- 4. Políticas de Acesso RLS para Itens de Checklist
DROP POLICY IF EXISTS "Permitir leitura itens_checklist para todos" ON public.itens_checklist;
CREATE POLICY "Permitir leitura itens_checklist para todos" ON public.itens_checklist FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao itens_checklist para autenticados" ON public.itens_checklist;
CREATE POLICY "Permitir insercao itens_checklist para autenticados" ON public.itens_checklist FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao itens_checklist para autenticados" ON public.itens_checklist;
CREATE POLICY "Permitir atualizacao itens_checklist para autenticados" ON public.itens_checklist FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir exclusao itens_checklist para autenticados" ON public.itens_checklist;
CREATE POLICY "Permitir exclusao itens_checklist para autenticados" ON public.itens_checklist FOR DELETE USING (true);

-- 5. Habilitar sincronização Realtime para as tabelas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.checklists;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_checklist;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;
