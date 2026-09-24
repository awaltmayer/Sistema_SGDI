-- ==============================================================================
-- REFATORAÇÃO COMPLETA: IDs NUMERAIS SEQUENCIAIS AUTO-INCREMENTAIS (1, 2, 3...)
-- Sistema SGDI - Todas as tabelas da aplicação
-- Data: 2026-09-24
-- ==============================================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse o Dashboard do seu projeto no Supabase (https://supabase.com/dashboard).
-- 2. No menu lateral esquerdo, clique em "SQL Editor".
-- 3. Cole todo o conteúdo deste arquivo e clique no botão verde "Run".
-- ==============================================================================

-- 1. Remove restrições e tabelas antigas em cascata (reset completo dos dados)
DROP TABLE IF EXISTS public.itens_checklist CASCADE;
DROP TABLE IF EXISTS public.checklists CASCADE;
DROP TABLE IF EXISTS public.comentarios CASCADE;
DROP TABLE IF EXISTS public.cartoes CASCADE;
DROP TABLE IF EXISTS public.membros_equipe CASCADE;

-- 2. Tabela: MEMBROS DA EQUIPE (ID numeral sequencial BIGSERIAL: 1, 2, 3, 4...)
CREATE TABLE public.membros_equipe (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    id_usuario_membro UUID,
    nome_completo TEXT NOT NULL,
    iniciais TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    funcao TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    url_avatar TEXT,
    convidado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela: CARTÕES / TAREFAS (ID numeral sequencial BIGSERIAL: 1, 2, 3, 4...)
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
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela: COMENTÁRIOS (ID numeral sequencial BIGSERIAL: 1, 2, 3, 4...)
CREATE TABLE public.comentarios (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    id_cartao BIGINT NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
    id_autor BIGINT REFERENCES public.membros_equipe(id) ON DELETE SET NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela: CHECKLISTS (ID numeral sequencial BIGSERIAL: 1, 2, 3, 4...)
CREATE TABLE public.checklists (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    id_cartao BIGINT NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    posicao INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela: ITENS DO CHECKLIST (ID numeral sequencial BIGSERIAL: 1, 2, 3, 4...)
CREATE TABLE public.itens_checklist (
    id BIGSERIAL PRIMARY KEY,
    id_checklist BIGINT NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    esta_concluido BOOLEAN NOT NULL DEFAULT false,
    posicao INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabela: PERFIS DE USUÁRIO (Vínculo direto 1:1 com auth.users)
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL DEFAULT '',
    iniciais TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    tema TEXT NOT NULL DEFAULT 'system',
    url_avatar TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Índices de Otimização e Performance
CREATE INDEX IF NOT EXISTS idx_cartoes_ids_responsaveis ON public.cartoes USING GIN (ids_responsaveis);
CREATE INDEX IF NOT EXISTS idx_cartoes_coluna_posicao ON public.cartoes (coluna, posicao);
CREATE INDEX IF NOT EXISTS idx_comentarios_id_cartao ON public.comentarios (id_cartao);
CREATE INDEX IF NOT EXISTS idx_checklists_id_cartao ON public.checklists (id_cartao);
CREATE INDEX IF NOT EXISTS idx_itens_checklist_id_checklist ON public.itens_checklist (id_checklist);

-- 9. Habilitação de Segurança por Linha (RLS - Row Level Security)
ALTER TABLE public.membros_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- 10. Políticas de Acesso RLS (Permissões de leitura e gravação)
-- Membros da Equipe
DROP POLICY IF EXISTS "membros_equipe_select" ON public.membros_equipe;
CREATE POLICY "membros_equipe_select" ON public.membros_equipe FOR SELECT USING (true);
DROP POLICY IF EXISTS "membros_equipe_insert" ON public.membros_equipe;
CREATE POLICY "membros_equipe_insert" ON public.membros_equipe FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "membros_equipe_update" ON public.membros_equipe;
CREATE POLICY "membros_equipe_update" ON public.membros_equipe FOR UPDATE USING (true);
DROP POLICY IF EXISTS "membros_equipe_delete" ON public.membros_equipe;
CREATE POLICY "membros_equipe_delete" ON public.membros_equipe FOR DELETE USING (true);

-- Cartões
DROP POLICY IF EXISTS "cartoes_select" ON public.cartoes;
CREATE POLICY "cartoes_select" ON public.cartoes FOR SELECT USING (true);
DROP POLICY IF EXISTS "cartoes_insert" ON public.cartoes;
CREATE POLICY "cartoes_insert" ON public.cartoes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "cartoes_update" ON public.cartoes;
CREATE POLICY "cartoes_update" ON public.cartoes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "cartoes_delete" ON public.cartoes;
CREATE POLICY "cartoes_delete" ON public.cartoes FOR DELETE USING (true);

-- Comentários
DROP POLICY IF EXISTS "comentarios_select" ON public.comentarios;
CREATE POLICY "comentarios_select" ON public.comentarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "comentarios_insert" ON public.comentarios;
CREATE POLICY "comentarios_insert" ON public.comentarios FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "comentarios_update" ON public.comentarios;
CREATE POLICY "comentarios_update" ON public.comentarios FOR UPDATE USING (true);
DROP POLICY IF EXISTS "comentarios_delete" ON public.comentarios;
CREATE POLICY "comentarios_delete" ON public.comentarios FOR DELETE USING (true);

-- Checklists
DROP POLICY IF EXISTS "checklists_select" ON public.checklists;
CREATE POLICY "checklists_select" ON public.checklists FOR SELECT USING (true);
DROP POLICY IF EXISTS "checklists_insert" ON public.checklists;
CREATE POLICY "checklists_insert" ON public.checklists FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "checklists_update" ON public.checklists;
CREATE POLICY "checklists_update" ON public.checklists FOR UPDATE USING (true);
DROP POLICY IF EXISTS "checklists_delete" ON public.checklists;
CREATE POLICY "checklists_delete" ON public.checklists FOR DELETE USING (true);

-- Itens de Checklist
DROP POLICY IF EXISTS "itens_checklist_select" ON public.itens_checklist;
CREATE POLICY "itens_checklist_select" ON public.itens_checklist FOR SELECT USING (true);
DROP POLICY IF EXISTS "itens_checklist_insert" ON public.itens_checklist;
CREATE POLICY "itens_checklist_insert" ON public.itens_checklist FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "itens_checklist_update" ON public.itens_checklist;
CREATE POLICY "itens_checklist_update" ON public.itens_checklist FOR UPDATE USING (true);
DROP POLICY IF EXISTS "itens_checklist_delete" ON public.itens_checklist;
CREATE POLICY "itens_checklist_delete" ON public.itens_checklist FOR DELETE USING (true);

-- Perfis
DROP POLICY IF EXISTS "perfis_select" ON public.perfis;
CREATE POLICY "perfis_select" ON public.perfis FOR SELECT USING (true);
DROP POLICY IF EXISTS "perfis_insert" ON public.perfis;
CREATE POLICY "perfis_insert" ON public.perfis FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "perfis_update" ON public.perfis;
CREATE POLICY "perfis_update" ON public.perfis FOR UPDATE USING (true);
DROP POLICY IF EXISTS "perfis_delete" ON public.perfis;
CREATE POLICY "perfis_delete" ON public.perfis FOR DELETE USING (true);

-- 11. Sincronização em Tempo Real (Realtime)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.cartoes;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.membros_equipe;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.comentarios;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.checklists;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_checklist;
    EXCEPTION WHEN duplicate_object THEN NULL; END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.perfis;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- 12. Carga Inicial de Dados (Seed com IDs sequenciais 1, 2, 3, 4...)
INSERT INTO public.membros_equipe (id, nome_completo, iniciais, email, funcao, status) VALUES
(1, 'Enio Muliterno Neto', 'EN', '1138165@atitus.edu.br', 'owner', 'active'),
(2, 'Augusto Wolfart Altmayer', 'AA', '1138100@atitus.edu.br', 'member', 'active'),
(3, 'Ricardo Pereira Drews', 'RD', '1138132@atitus.edu.br', 'member', 'active'),
(4, 'Luiz Henrique Appelt Weller', 'LW', '1138930@atitus.edu.br', 'member', 'active');

-- Cartões iniciais
INSERT INTO public.cartoes (id, titulo, descricao, coluna, prioridade, ids_responsaveis, posicao, data_vencimento) VALUES
(1, 'Auditoria do sistema de design', 'Audite os tokens e a biblioteca de componentes atuais. Documente as lacunas e proponha atualizações antes do kickoff do sprint do Q2.', 'todo', 'high', ARRAY['1'], 0, CURRENT_DATE + INTERVAL '14 days'),
(2, 'Escrever documentação de onboarding', 'Crie um guia passo a passo para novos membros da equipe.', 'todo', 'low', ARRAY['4'], 1, CURRENT_DATE + INTERVAL '5 days'),
(3, 'Atualizar página de preços', 'Revise o texto e o layout da página de preços.', 'in-progress', 'medium', ARRAY['2'], 0, CURRENT_DATE - INTERVAL '2 days'),
(4, 'Auditoria de acessibilidade', 'Execute uma auditoria de acessibilidade em todas as páginas públicas e produza um relatório de conformidade WCAG 2.1 AA.', 'done', 'high', ARRAY['3'], 0, CURRENT_DATE + INTERVAL '20 days');

-- Checklists e itens iniciais de demonstração
INSERT INTO public.checklists (id, id_cartao, titulo, posicao) VALUES
(1, 1, 'Levantamento de Componentes', 0),
(2, 3, 'Revisão de Conteúdo e Preços', 0);

INSERT INTO public.itens_checklist (id, id_checklist, titulo, esta_concluido, posicao) VALUES
(1, 1, 'Mapear botões e variações de estado', true, 0),
(2, 1, 'Auditar paleta de cores e contraste', false, 1),
(3, 1, 'Verificar compatibilidade com modo escuro', false, 2),
(4, 2, 'Validar novos valores com a diretoria', true, 0),
(5, 2, 'Atualizar tabela comparativa de planos', false, 1);

-- 13. Ajuste das sequências auto-incrementais para os próximos registros
SELECT setval('public.membros_equipe_id_seq', (SELECT MAX(id) FROM public.membros_equipe));
SELECT setval('public.cartoes_id_seq', (SELECT MAX(id) FROM public.cartoes));
SELECT setval('public.checklists_id_seq', (SELECT MAX(id) FROM public.checklists));
SELECT setval('public.itens_checklist_id_seq', (SELECT MAX(id) FROM public.itens_checklist));
SELECT setval('public.comentarios_id_seq', COALESCE((SELECT MAX(id) FROM public.comentarios), 1), (SELECT COUNT(*) > 0 FROM public.comentarios));
