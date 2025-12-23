import { getServiceSupabase } from '@/lib/supabase'
import type { Category, Dish } from '@/types/menu'

export async function getCategories(): Promise<Category[]> {
    try {
        const supabase = getServiceSupabase()
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('order', { ascending: true })

        if (error) {
            console.error('Error fetching categories from DB:', error)
            throw error
        }

        return data.map(c => ({
            ...c,
            $id: c.id,
            $createdAt: c.created_at
        })) as Category[]
    } catch (error) {
        console.error('Exception fetching categories:', error)
        throw error
    }
}

export async function getDishes(): Promise<Dish[]> {
    try {
        const supabase = getServiceSupabase()
        const { data, error } = await supabase
            .from('dishes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching dishes from DB:', error)
            throw error
        }

        return data.map(d => ({
            ...d,
            $id: d.id,
            categoryId: d.category_id,
            imageId: d.image_url,
            available: d.available
        })) as Dish[]
    } catch (error) {
        console.error('Exception fetching dishes:', error)
        throw error
    }
}
