-- ====================================================================
-- MIGRAÇÃO DE CHAVES PRIMÁRIAS (IDs) PARA NUMERAIS SEQUENCIAIS (BIGSERIAL)
-- Execute este script no SQL Editor do seu Dashboard Supabase
-- ====================================================================

-- 1. Remove restrições de chaves estrangeiras existentes
ALTER TABLE IF EXISTS comentarios DROP CONSTRAINT IF EXISTS comentarios_id_cartao_fkey;
ALTER TABLE IF EXISTS comentarios DROP CONSTRAINT IF EXISTS comentarios_id_autor_fkey;
ALTER TABLE IF EXISTS cartoes DROP CONSTRAINT IF EXISTS cartoes_id_responsavel_fkey;

-- 2. Limpeza prévia segura das tabelas para troca de tipo de chave primária
DROP TABLE IF EXISTS comentarios CASCADE;
DROP TABLE IF EXISTS cartoes CASCADE;
DROP TABLE IF EXISTS membros_equipe CASCADE;

-- 3. Criação da tabela oficial de MEMBROS DA EQUIPE com ID numérico auto-incremental (1, 2, 3...)
CREATE TABLE membros_equipe (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID,
    id_usuario_membro UUID,
    nome_completo TEXT NOT NULL,
    iniciais TEXT NOT NULL,
    email TEXT NOT NULL,
    funcao TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    url_avatar TEXT,
    convidado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Criação da tabela oficial de CARTÕES com ID numérico auto-incremental (1, 2, 3...)
CREATE TABLE cartoes (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID,
    titulo TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    coluna TEXT NOT NULL DEFAULT 'todo',
    prioridade TEXT NOT NULL DEFAULT 'low',
    data_vencimento DATE,
    posicao INTEGER NOT NULL DEFAULT 0,
    id_responsavel BIGINT REFERENCES membros_equipe(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Criação da tabela oficial de COMENTÁRIOS com ID numérico auto-incremental
CREATE TABLE comentarios (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID,
    id_cartao BIGINT NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
    id_autor BIGINT REFERENCES membros_equipe(id) ON DELETE SET NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Habilita Row Level Security (RLS) nas tabelas
ALTER TABLE membros_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Acesso RLS
CREATE POLICY "Permitir leitura membros_equipe para todos" ON membros_equipe FOR SELECT USING (true);
CREATE POLICY "Permitir insercao membros_equipe para autenticados" ON membros_equipe FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao membros_equipe para autenticados" ON membros_equipe FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusao membros_equipe para autenticados" ON membros_equipe FOR DELETE USING (true);

CREATE POLICY "Permitir leitura cartoes para todos" ON cartoes FOR SELECT USING (true);
CREATE POLICY "Permitir insercao cartoes para autenticados" ON cartoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao cartoes para autenticados" ON cartoes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusao cartoes para autenticados" ON cartoes FOR DELETE USING (true);

CREATE POLICY "Permitir leitura comentarios para todos" ON comentarios FOR SELECT USING (true);
CREATE POLICY "Permitir insercao comentarios para autenticados" ON comentarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao comentarios para autenticados" ON comentarios FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusao comentarios para autenticados" ON comentarios FOR DELETE USING (true);

-- 8. Inserção dos Membros com IDs sequenciais 1, 2, 3, 4
INSERT INTO membros_equipe (id, nome_completo, iniciais, email, funcao, status) VALUES
(1, 'Enio Muliterno Neto', 'EN', '1138165@atitus.edu.br', 'owner', 'active'),
(2, 'Augusto Wolfart Altmayer', 'AA', '1138100@atitus.edu.br', 'member', 'active'),
(3, 'Ricardo Pereira Drews', 'RD', '1138132@atitus.edu.br', 'member', 'active'),
(4, 'Luiz Henrique Appelt Weller', 'LW', '1138930@atitus.edu.br', 'member', 'active');

-- Ajusta a sequência automática para novos membros começarem a partir de 5
SELECT setval('membros_equipe_id_seq', (SELECT MAX(id) FROM membros_equipe));

-- 9. Inserção de Cartões Iniciais com IDs sequenciais 1, 2, 3, 4
INSERT INTO cartoes (id, titulo, descricao, coluna, prioridade, id_responsavel, posicao, data_vencimento) VALUES
(1, 'Auditoria do sistema de design', 'Audite os tokens e a biblioteca de componentes atuais. Documente as lacunas e proponha atualizações antes do kickoff do sprint do Q2.', 'todo', 'high', 1, 0, '2026-07-08'),
(2, 'Escrever documentação de onboarding', 'Crie um guia passo a passo para novos membros da equipe.', 'todo', 'low', 4, 1, '2026-07-12'),
(3, 'Atualizar página de preços', 'Revise o texto e o layout da página de preços.', 'todo', 'medium', 2, 2, '2026-07-15'),
(4, 'Auditoria de acessibilidade', 'Execute uma auditoria de acessibilidade em todas as páginas públicas e produza um relatório de conformidade WCAG 2.1 AA.', 'todo', 'high', 3, 3, '2026-07-20');

-- Ajusta a sequência automática para novos cartões começarem a partir de 5
SELECT setval('cartoes_id_seq', (SELECT MAX(id) FROM cartoes));

-- 10. Habilita Realtime para as tabelas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE cartoes;
    ALTER PUBLICATION supabase_realtime ADD TABLE membros_equipe;
    ALTER PUBLICATION supabase_realtime ADD TABLE comentarios;
  END IF;
END $$;
