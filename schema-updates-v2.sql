-- Atualizações do Schema para v2

-- 1. Novas colunas para personalização avançada do cardápio e banner
ALTER TABLE public.menu_settings 
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS card_background_color TEXT DEFAULT '#18181b',
ADD COLUMN IF NOT EXISTS card_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS card_border_radius TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS card_size TEXT DEFAULT 'normal';

-- 2. Tabela de Chamadas de Garçom
CREATE TABLE IF NOT EXISTS public.waiter_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    table_number INTEGER NOT NULL,
    customer_name TEXT,
    type TEXT NOT NULL CHECK (type IN ('bill', 'assistance', 'order_ready')),
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'acknowledged', 'completed')),
    notes TEXT
);

-- Habilitar RLS para waiter_calls
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para waiter_calls
-- Qualquer um pode criar uma chamada (cliente)
CREATE POLICY "Public Insert Waiter Calls" ON public.waiter_calls FOR INSERT WITH CHECK (true);

-- Apenas admin pode ver todas e atualizar (garçom/staff)
CREATE POLICY "Admin All Waiter Calls" ON public.waiter_calls FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para updated_at em waiter_calls (assumindo que a função update_updated_at_column já existe do schema anterior)
CREATE TRIGGER update_waiter_calls_updated_at
    BEFORE UPDATE ON public.waiter_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON public.waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_created_at ON public.waiter_calls(created_at);
