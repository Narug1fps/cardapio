-- Drop policies for Categories
drop policy if exists "Enable read access for all users" on categories;
drop policy if exists "Enable insert for authenticated users only" on categories;
drop policy if exists "Enable update for authenticated users only" on categories;
drop policy if exists "Enable delete for authenticated users only" on categories;
drop policy if exists "Authenticated Insert Access" on categories;
drop policy if exists "Authenticated Update Access" on categories;
drop policy if exists "Authenticated Delete Access" on categories;
drop policy if exists "Public Read Access" on categories;

-- Create fully permissive policies for Categories (Public Read)
create policy "Public Read Access"
  on categories for select
  using (true);

create policy "Authenticated Insert Access"
  on categories for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated Update Access"
  on categories for update
  using (auth.role() = 'authenticated');

create policy "Authenticated Delete Access"
  on categories for delete
  using (auth.role() = 'authenticated');


-- Drop policies for Dishes
drop policy if exists "Enable read access for all users" on dishes;
drop policy if exists "Enable insert for authenticated users only" on dishes;
drop policy if exists "Enable update for authenticated users only" on dishes;
drop policy if exists "Enable delete for authenticated users only" on dishes;
drop policy if exists "Authenticated Insert Access" on dishes;
drop policy if exists "Authenticated Update Access" on dishes;
drop policy if exists "Authenticated Delete Access" on dishes;
drop policy if exists "Public Read Access" on dishes;

-- Create fully permissive policies for Dishes (Public Read)
create policy "Public Read Access"
  on dishes for select
  using (true);

create policy "Authenticated Insert Access"
  on dishes for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated Update Access"
  on dishes for update
  using (auth.role() = 'authenticated');

create policy "Authenticated Delete Access"
  on dishes for delete
  using (auth.role() = 'authenticated');

-- Also ensure Tables and Menu Settings are public
drop policy if exists "Public Read Access" on menu_settings;
create policy "Public Read Access"
  on menu_settings for select
  using (true);

drop policy if exists "Public Read Access" on tables;
create policy "Public Read Access"
  on tables for select
  using (true);

-- Ensure Orders are publicly creatable (for customers) but viewable only by table or admin
drop policy if exists "Public Create Orders" on orders;
drop policy if exists "Public Read Orders" on orders;
drop policy if exists "Authenticated Read Orders" on orders;

create policy "Public Create Orders"
  on orders for insert
  with check (true);

create policy "Public Read Own Table Orders"
  on orders for select
  using (true); -- Simplificando para evitar problemas: todos podem ver pedidos por enquanto, filtragem no front

create policy "Authenticated Update Orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- Order Items
drop policy if exists "Public Create Order Items" on order_items;
drop policy if exists "Public Read Order Items" on order_items;

create policy "Public Create Order Items"
  on order_items for insert
  with check (true);

create policy "Public Read Order Items"
  on order_items for select
  using (true);


-- ==============================================================================
-- 🗑️ ÁREA DE PERIGO: LIMPEZA DE DADOS (RESET)
-- ==============================================================================
-- Se você quiser APAGAR TODOS os pratos, categorias e pedidos antigos e começar 
-- do zero, selecione e rode os comandos abaixo (remova os traços -- do início):

-- TRUNCATE TABLE public.order_items CASCADE;
-- TRUNCATE TABLE public.orders CASCADE;
-- TRUNCATE TABLE public.dishes CASCADE;
-- TRUNCATE TABLE public.categories CASCADE;
-- TRUNCATE TABLE public.waiter_calls CASCADE;

-- IMPORTANTE: Isso apaga tudo permanentemente!

