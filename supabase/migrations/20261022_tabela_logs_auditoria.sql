-- ==============================================================================
-- MIGRAÇÃO: TABELA DE LOGS DE AUDITORIA E RASTREABILIDADE
-- Registra eventos e operações dos usuários para auditoria e segurança
-- Data: 2026-10-22
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.logs_auditoria (
    id BIGSERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario_nome TEXT NOT NULL DEFAULT 'Usuário',
    usuario_email TEXT,
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id TEXT,
    entidade_titulo TEXT,
    detalhes TEXT NOT NULL,
    metadados JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comentários na tabela e colunas para documentação do esquema
COMMENT ON TABLE public.logs_auditoria IS 'Trilha de auditoria centralizada do sistema SGDI';
COMMENT ON COLUMN public.logs_auditoria.acao IS 'Tipo da ação: CRIACAO, ATUALIZACAO, EXCLUSAO, MOVIMENTACAO, STATUS, CRONOMETRO, CONFIGURACAO, ACESSO';
COMMENT ON COLUMN public.logs_auditoria.entidade IS 'Entidade afetada: Demanda, Checklist, Comentário, Cronômetro, Sistema, Perfil';

-- Índices otimizados para filtros de auditoria e análises de incidentes
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_criado_em ON public.logs_auditoria(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_acao ON public.logs_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_entidade ON public.logs_auditoria(entidade);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_id_usuario ON public.logs_auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_entidade_id ON public.logs_auditoria(entidade_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança: usuários autenticados podem consultar e registrar logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'logs_auditoria' 
        AND policyname = 'Permitir leitura de logs para usuarios autenticados'
    ) THEN
        CREATE POLICY "Permitir leitura de logs para usuarios autenticados"
            ON public.logs_auditoria
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'logs_auditoria' 
        AND policyname = 'Permitir insercao de logs para usuarios autenticados'
    ) THEN
        CREATE POLICY "Permitir insercao de logs para usuarios autenticados"
            ON public.logs_auditoria
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;
END $$;
