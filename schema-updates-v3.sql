-- Create a storage bucket for restaurant assets if it doesn't exist
insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

-- Set up policies for the restaurant-assets bucket

-- Drop existing policies first to avoid conflicts
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Allow Uploads" on storage.objects;
drop policy if exists "Allow Updates" on storage.objects;
drop policy if exists "Allow Deletes" on storage.objects;

-- Allow public read access to everyone
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'restaurant-assets' );

-- Allow authenticated users to upload files
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'restaurant-assets' );

-- Allow authenticated users to update their files
create policy "Allow Updates"
  on storage.objects for update
  using ( bucket_id = 'restaurant-assets' );

-- Allow authenticated users to delete files
create policy "Allow Deletes"
  on storage.objects for delete
  using ( bucket_id = 'restaurant-assets' );


-- Update Tables table to support reservation status
alter table public.tables 
add column if not exists status text check (status in ('available', 'occupied', 'reserved')) default 'available';

-- If existing tables have null status, update them
update public.tables set status = 'available' where status is null;

-- Update Waiter Calls table to track timestamps
alter table public.waiter_calls
add column if not exists acknowledged_at timestamp with time zone,
add column if not exists completed_at timestamp with time zone;
