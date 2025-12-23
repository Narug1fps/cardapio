import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import type { UpdateCategoryInput } from '@/types/menu'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = getServiceSupabase()

        const { data: category, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        const mappedCategory = {
            ...category,
            $id: category.id,
            $createdAt: category.created_at
        }

        return NextResponse.json({ category: mappedCategory })
    } catch (error) {
        console.error('Error fetching category:', error)
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body: UpdateCategoryInput = await request.json()
        const supabase = getServiceSupabase()

        const updates: any = {}
        if (body.name) updates.name = body.name
        if (body.description !== undefined) updates.description = body.description
        if (body.order !== undefined) updates.order = body.order

        const { data: category, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        const mappedCategory = {
            ...category,
            $id: category.id,
            $createdAt: category.created_at
        }

        return NextResponse.json({ category: mappedCategory })
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = getServiceSupabase()

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
