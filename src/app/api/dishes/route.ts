import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import type { CreateDishInput } from '@/types/menu'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('categoryId')

        const supabase = getServiceSupabase()
        let query = supabase
            .from('dishes')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        const { data: dishes, error, count } = await query

        if (error) {
            throw error
        }

        // Map snake_case to camelCase for frontend compatibility if needed, 
        // but easier to keep keys same or map them. 
        // Reviewing frontend, it uses 'categoryId' and 'imageId'.
        // Supabase uses 'category_id' (from Schema).
        // I should map them or update types. 
        // For minimal breakage, I'll map them here.

        const mappedDishes = dishes?.map(dish => ({
            ...dish,
            $id: dish.id, // Map UUID to $id for frontend compatibility
            categoryId: dish.category_id,
            imageId: dish.image_url, // Using image_url directly now probably? Or storing ID? Schema said image_url.
            available: dish.available
        }))

        return NextResponse.json(mappedDishes || [])
    } catch (error) {
        console.error('Error fetching dishes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dishes' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateDishInput = await request.json()
        const supabase = getServiceSupabase()

        // Mapping input camelCase to snake_case storage
        const { data: dish, error } = await supabase
            .from('dishes')
            .insert({
                name: body.name,
                description: body.description,
                price: body.price,
                category_id: body.categoryId,
                image_url: body.imageId, // Assuming imageId input holds the URL or path now
                available: body.available ?? true
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        const mappedDish = {
            ...dish,
            $id: dish.id,
            categoryId: dish.category_id,
            imageId: dish.image_url,
            available: dish.available
        }

        return NextResponse.json({ dish: mappedDish }, { status: 201 })
    } catch (error) {
        console.error('Error creating dish:', error)
        return NextResponse.json(
            { error: 'Failed to create dish' },
            { status: 500 }
        )
    }
}
