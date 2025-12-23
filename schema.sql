-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0 NOT NULL
);

-- Create dishes table
CREATE TABLE public.dishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    image_url TEXT,
    available BOOLEAN DEFAULT true NOT NULL
);

-- Create storage bucket for dish images
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Allow public read access (everyone can see menu)
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Dishes" ON public.dishes FOR SELECT USING (true);

-- Allow authenticated users (admin) to modify
-- Assuming any logged-in user is admin for this simple app
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Dishes" ON public.dishes FOR ALL USING (auth.role() = 'authenticated');

-- Storage Policies
CREATE POLICY "Public Access Dishes Images" ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');
CREATE POLICY "Admin Upload Dishes Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dish-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Dishes Images" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'dish-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Dishes Images" ON storage.objects FOR DELETE USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');
