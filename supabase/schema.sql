-- ==============================================================================
-- BANCO DE IDEIAS COM IA - SUPABASE POSTGRES SCHEMA DDL
-- Versão 1.0 (Setembro de 2026)
-- Inclui tabelas, restrições, índices, RLS (Row Level Security) e triggers.
-- ==============================================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela: profiles (estende auth.users com dados de perfil e papel)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('colaborador', 'avaliador', 'admin')),
    area TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela: ideas (ideias submetidas ou em rascunho)
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    area TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('rascunho', 'em_avaliacao', 'aprovada', 'reprovada', 'standby')),
    discovery_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela: generated_assets (artefatos de IA: protótipo, prompt Lovable, doc técnica, apresentação comercial)
CREATE TABLE IF NOT EXISTS public.generated_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('prototype', 'technical_prompt', 'technical_doc', 'commercial_deck')),
    content_text TEXT,
    content_url TEXT,
    version INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela: goals (metas estratégicas cadastradas pelo administrador)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    indicator TEXT NOT NULL,
    owner_area TEXT NOT NULL,
    deadline DATE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabela: goal_alignments (resultado da classificação automática da ideia frente às metas)
CREATE TABLE IF NOT EXISTS public.goal_alignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    adherence_score NUMERIC(5,2) NOT NULL CHECK (adherence_score >= 0 AND adherence_score <= 100),
    adherence_label TEXT NOT NULL CHECK (adherence_label IN ('alta', 'media', 'baixa')),
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Tabela: evaluations (decisões registradas pelos gestores/avaliadores)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    decision TEXT NOT NULL CHECK (decision IN ('aprovada', 'reprovada', 'standby')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Tabela: notifications (notificações in-app por usuário)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_ideas_author ON public.ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_area ON public.ideas(area);
CREATE INDEX IF NOT EXISTS idx_generated_assets_idea ON public.generated_assets(idea_id);
CREATE INDEX IF NOT EXISTS idx_goal_alignments_idea ON public.goal_alignments(idea_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_idea ON public.evaluations(idea_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_alignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Leitura pública de perfis autenticados"
    ON public.profiles FOR SELECT TO authenticated USING (true);

-- Políticas para ideas
CREATE POLICY "Colaborador lê suas próprias ideias ou ideias submetidas são lidas por avaliadores"
    ON public.ideas FOR SELECT TO authenticated
    USING (
        author_id = auth.uid() 
        OR (
            status <> 'rascunho' 
            AND EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.role IN ('avaliador', 'admin')
            )
        )
    );

CREATE POLICY "Colaborador pode criar rascunhos"
    ON public.ideas FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Colaborador edita rascunhos próprios"
    ON public.ideas FOR UPDATE TO authenticated
    USING (author_id = auth.uid() AND status = 'rascunho')
    WITH CHECK (author_id = auth.uid());

-- Políticas para generated_assets
CREATE POLICY "Visualização de artefatos da ideia autorizada"
    ON public.generated_assets FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.ideas 
            WHERE ideas.id = generated_assets.idea_id 
            AND (
                ideas.author_id = auth.uid() 
                OR (ideas.status <> 'rascunho' AND EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = auth.uid() AND profiles.role IN ('avaliador', 'admin')
                ))
            )
        )
    );

-- Políticas para goals
CREATE POLICY "Leitura de metas corporativas para todos"
    ON public.goals FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Apenas admin gerencia metas"
    ON public.goals FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Políticas para evaluations
CREATE POLICY "Avaliadores e autores visualizam avaliações"
    ON public.evaluations FOR SELECT TO authenticated
    USING (
        evaluator_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.ideas 
            WHERE ideas.id = evaluations.idea_id AND ideas.author_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('avaliador', 'admin')
        )
    );

CREATE POLICY "Apenas avaliadores e admins registram avaliações"
    ON public.evaluations FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('avaliador', 'admin')
        )
    );

-- Políticas para notifications
CREATE POLICY "Usuário acessa e atualiza apenas suas próprias notificações"
    ON public.notifications FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
