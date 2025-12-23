import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import type { UpdateDishInput } from '@/types/menu'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = getServiceSupabase()

        const { data: dish, error } = await supabase
            .from('dishes')
            .select('*')
            .eq('id', id)
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

        return NextResponse.json({ dish: mappedDish })
    } catch (error) {
        console.error('Error fetching dish:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dish' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body: UpdateDishInput = await request.json()
        const supabase = getServiceSupabase()

        // Construct update object with snake_case keys
        const updates: any = {}
        if (body.name) updates.name = body.name
        if (body.description) updates.description = body.description
        if (body.price) updates.price = body.price
        if (body.categoryId) updates.category_id = body.categoryId
        if (body.imageId !== undefined) updates.image_url = body.imageId
        if (body.available !== undefined) updates.available = body.available

        const { data: dish, error } = await supabase
            .from('dishes')
            .update(updates)
            .eq('id', id)
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

        return NextResponse.json({ dish: mappedDish })
    } catch (error) {
        console.error('Error updating dish:', error)
        return NextResponse.json(
            { error: 'Failed to update dish' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = getServiceSupabase()

        const { error } = await supabase
            .from('dishes')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting dish:', error)
        return NextResponse.json(
            { error: 'Failed to delete dish' },
            { status: 500 }
        )
    }
}
