-- Adicionar coluna 'paid' na tabela orders
ALTER TABLE public.orders ADD COLUMN paid BOOLEAN DEFAULT false;

-- Atualizar pedidos existentes como pagos se já foram entregues (opcional, para migração)
-- UPDATE public.orders SET paid = true WHERE status = 'delivered';
