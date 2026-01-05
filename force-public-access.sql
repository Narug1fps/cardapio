-- ==============================================================================
-- 🔓 SCRIPT DE LIBERAÇÃO TOTAL DE ACESSO (NUCLEAR)
-- ==============================================================================
-- Este script remove todas as travas de segurança e permite que:
-- 1. Qualquer pessoa (mesmo sem login) VEJA os pratos e categorias.
-- 2. Qualquer usuário LOGADO edite ou apague QUALQUER prato ou categoria.

-- A. GARANTIR QUE RLS ESTÁ ATIVO (para aplicar as regras novas)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- B. REMOVER TODAS AS REGRAS ANTIGAS QUE PODEM ESTAR BLOQUEANDO
-- (Removemos por nome para garantir limpeza)

-- Categorias
DROP POLICY IF EXISTS "Public Access" ON public.categories;
DROP POLICY IF EXISTS "Public Read Access" ON public.categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON public.categories;
DROP POLICY IF EXISTS "Authenticated Update Access" ON public.categories;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON public.categories;
DROP POLICY IF EXISTS "Authenticated All Access" ON public.categories;
DROP POLICY IF EXISTS "Nuclear Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Nuclear Auth Full Access Categories" ON public.categories;

-- Pratos
DROP POLICY IF EXISTS "Public Access" ON public.dishes;
DROP POLICY IF EXISTS "Public Read Access" ON public.dishes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated Update Access" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated All Access" ON public.dishes;
DROP POLICY IF EXISTS "Nuclear Public Read Dishes" ON public.dishes;
DROP POLICY IF EXISTS "Nuclear Auth Full Access Dishes" ON public.dishes;


-- C. CRIAR AS "REGRAS NUCLEARES" (Permite tudo para quem deve)

-- 1. LEITURA PÚBLICA (Todos veem)
CREATE POLICY "Nuclear Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Nuclear Public Read Dishes" ON public.dishes FOR SELECT USING (true);

-- 2. EDIÇÃO COLETIVA (Qualquer usuário logado mexe em tudo)
-- IMPORTANTE: Isso ignora quem criou. Se você está logado, você é dono.
CREATE POLICY "Nuclear Auth Full Access Categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Nuclear Auth Full Access Dishes" ON public.dishes FOR ALL USING (auth.role() = 'authenticated');


-- ==============================================================================
-- 🆘 OPÇÃO DE EMERGÊNCIA (SE AINDA NÃO FUNCIONAR)
-- ==============================================================================
-- Se mesmo assim os dados não aparecerem, remova os traços (--) das linhas abaixo
-- e rode. Isso DESLIGA completamente a segurança das tabelas.

-- ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dishes DISABLE ROW LEVEL SECURITY;
