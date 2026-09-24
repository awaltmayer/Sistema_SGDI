-- ==============================================================================
-- MIGRAÇÃO DEFINITIVA: TABELA ÚNICA USUÁRIOS + IDS NUMERAIS SEQUENCIAIS (BIGSERIAL)
-- Compatibilidade 100% com o frontend do Sistema SGDI
-- Data: 2026-09-24
-- ==============================================================================

-- 1. Limpar tabelas antigas (ordem de dependência reversa com CASCADE)
DROP TABLE IF EXISTS public.itens_checklist CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;
DROP TABLE IF EXISTS public.comentarios CASCADE;
DROP TABLE IF EXISTS public.cartoes CASCADE;
DROP TABLE IF EXISTS public.membros_equipe CASCADE;
DROP TABLE IF EXISTS public.perfis CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- 2. Tabela única: USUÁRIOS (unifica perfil e equipe com ID sequencial 1, 2, 3...)
CREATE TABLE public.usuarios (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    nome_completo TEXT NOT NULL,
    iniciais TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    funcao TEXT NOT NULL DEFAULT 'Membro',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed')),
    tema TEXT NOT NULL DEFAULT 'dark' CHECK (tema IN ('light', 'dark', 'system')),
    url_avatar TEXT,
    convidado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela: CARTÕES / TAREFAS (ID sequencial BIGSERIAL: 1, 2, 3...)
CREATE TABLE public.cartoes (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    coluna TEXT NOT NULL DEFAULT 'todo',
    prioridade TEXT NOT NULL DEFAULT 'low',
    data_vencimento DATE,
    posicao INTEGER NOT NULL DEFAULT 0,
    ids_responsaveis TEXT[] NOT NULL DEFAULT '{}',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela: COMENTÁRIOS (ID sequencial BIGSERIAL: 1, 2, 3...)
CREATE TABLE public.comentarios (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    id_cartao BIGINT NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
    id_autor BIGINT REFERENCES public.usuarios(id) ON DELETE SET NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela: CHECKLISTS (ID sequencial BIGSERIAL: 1, 2, 3...)
CREATE TABLE public.checklists (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    id_cartao BIGINT NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    posicao INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabela: ITENS DO CHECKLIST (ID sequencial BIGSERIAL: 1, 2, 3...)
CREATE TABLE public.itens_checklist (
    id BIGSERIAL PRIMARY KEY,
    id_checklist BIGINT NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    esta_concluido BOOLEAN NOT NULL DEFAULT false,
    posicao INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Índices de Performance
CREATE INDEX idx_usuarios_id_usuario ON public.usuarios(id_usuario);
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_cartoes_coluna_posicao ON public.cartoes(coluna, posicao);
CREATE INDEX idx_cartoes_id_usuario ON public.cartoes(id_usuario);
CREATE INDEX idx_cartoes_responsaveis ON public.cartoes USING GIN(ids_responsaveis);
CREATE INDEX idx_comentarios_cartao ON public.comentarios(id_cartao, criado_em);
CREATE INDEX idx_checklists_cartao ON public.checklists(id_cartao, posicao);
CREATE INDEX idx_itens_checklist_pai ON public.itens_checklist(id_checklist, posicao);

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_checklist ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS flexíveis para leitura e escrita
CREATE POLICY "Permitir acesso completo a usuarios"
    ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a cartoes"
    ON public.cartoes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a comentarios"
    ON public.comentarios FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a checklists"
    ON public.checklists FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a itens_checklist"
    ON public.itens_checklist FOR ALL USING (true) WITH CHECK (true);

-- 10. Trigger para sincronizar novos usuários do auth.users automaticamente
CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.usuarios (id_usuario, nome_completo, iniciais, email, funcao, status, tema)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email) FROM 1 FOR 2)),
        NEW.email,
        'Membro',
        'active',
        'dark'
    )
    ON CONFLICT (email) DO UPDATE
    SET id_usuario = EXCLUDED.id_usuario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user();

-- 11. Vincular contas já existentes no auth.users
INSERT INTO public.usuarios (id_usuario, nome_completo, iniciais, email, funcao, status, tema)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
    UPPER(SUBSTRING(COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email) FROM 1 FOR 2)),
    email,
    'Membro',
    'active',
    'dark'
FROM auth.users
ON CONFLICT (email) DO UPDATE 
SET id_usuario = EXCLUDED.id_usuario;

-- 12. Habilitar Supabase Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'usuarios'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cartoes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cartoes;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comentarios'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.comentarios;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'checklists'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.checklists;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'itens_checklist'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_checklist;
    END IF;
END $$;

-- 13. Usuários Iniciais de Demonstração (IDs sequenciais 1, 2, 3...)
INSERT INTO public.usuarios (nome_completo, iniciais, email, funcao, status, tema)
VALUES
    ('Lucas Medeiros', 'LM', 'lucas@empresa.com', 'Desenvolvedor Frontend', 'active', 'dark'),
    ('Beatriz Lima', 'BL', 'beatriz@empresa.com', 'Designer UI/UX', 'active', 'dark'),
    ('Carlos Eduardo', 'CE', 'carlos@empresa.com', 'Tech Lead', 'active', 'dark'),
    ('Fernanda Souza', 'FS', 'fernanda@empresa.com', 'Gerente de Produto', 'active', 'dark')
ON CONFLICT (email) DO NOTHING;

-- Sincronizar os contadores de sequência BIGSERIAL
SELECT setval('usuarios_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.usuarios), 1));
SELECT setval('cartoes_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.cartoes), 1));
SELECT setval('comentarios_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.comentarios), 1));
SELECT setval('checklists_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.checklists), 1));
SELECT setval('itens_checklist_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.itens_checklist), 1));
