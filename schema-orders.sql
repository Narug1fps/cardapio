-- Sistema de Pedidos - Schema Adicional

-- Tabela de Mesas
CREATE TABLE public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    number INTEGER NOT NULL UNIQUE,
    name TEXT,
    seats INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true NOT NULL,
    qr_code TEXT
);

-- Tabela de Pedidos
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    table_number INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    total DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    notes TEXT,
    customer_name TEXT,
    estimated_time INTEGER DEFAULT 30, -- minutos
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Itens do Pedido
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    dish_id UUID REFERENCES public.dishes(id) ON DELETE SET NULL,
    dish_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT
);

-- Configurações do Design do Cardápio
CREATE TABLE public.menu_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    restaurant_name TEXT DEFAULT 'Sabores & Aromas' NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#f59e0b',
    secondary_color TEXT DEFAULT '#ea580c',
    accent_color TEXT DEFAULT '#fbbf24',
    background_color TEXT DEFAULT '#09090b',
    text_color TEXT DEFAULT '#ffffff',
    font_family TEXT DEFAULT 'Inter',
    show_prices BOOLEAN DEFAULT true,
    show_images BOOLEAN DEFAULT true,
    currency TEXT DEFAULT 'BRL',
    welcome_message TEXT DEFAULT 'Bem-vindo ao nosso restaurante!',
    footer_text TEXT
);

-- Tabela de Relatórios Diários (agregado para performance)
CREATE TABLE public.daily_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    most_ordered_dish_id UUID REFERENCES public.dishes(id) ON DELETE SET NULL,
    most_ordered_dish_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura
CREATE POLICY "Public Read Tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Public Read Menu Settings" ON public.menu_settings FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Own Orders" ON public.orders FOR SELECT USING (true);

-- Políticas de admin
CREATE POLICY "Admin All Tables" ON public.tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Order Items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Menu Settings" ON public.menu_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Daily Reports" ON public.daily_reports FOR ALL USING (auth.role() = 'authenticated');

-- Inserir configuração padrão
INSERT INTO public.menu_settings (restaurant_name) VALUES ('Sabores & Aromas');

-- Inserir algumas mesas de exemplo
INSERT INTO public.tables (number, name, seats) VALUES 
(1, 'Mesa 1', 4),
(2, 'Mesa 2', 4),
(3, 'Mesa 3', 2),
(4, 'Mesa 4', 6),
(5, 'Mesa 5', 4),
(6, 'Mesa 6', 8),
(7, 'Mesa 7', 2),
(8, 'Mesa 8', 4),
(9, 'Mesa 9', 4),
(10, 'Mesa 10', 6);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_settings_updated_at
    BEFORE UPDATE ON public.menu_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_table_id ON public.orders(table_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_daily_reports_date ON public.daily_reports(report_date);
