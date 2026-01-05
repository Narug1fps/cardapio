import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import type { CreateCategoryInput } from '@/types/menu'

export const dynamic = 'force-dynamic' // Desativa cache do Next.js

export async function GET() {
    try {
        console.log('[API] Buscando categorias...')
        const supabase = getServiceSupabase()

        const { data: categories, error, count } = await supabase
            .from('categories')
            .select('*', { count: 'exact' })
            .order('order', { ascending: true })

        if (error) {
            console.error('[API] Erro Supabase:', error)
            throw error
        }

        console.log(`[API] Sucesso! Encontradas ${categories?.length || 0} categorias.`)
        // console.log('[API] Dados:', JSON.stringify(categories, null, 2))

        const mappedCategories = categories?.map(c => ({
            ...c,
            $id: c.id,
            $createdAt: c.created_at
        }))

        return NextResponse.json(mappedCategories || [])
    } catch (error) {
        console.error('[API] Erro fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CreateCategoryInput = await request.json()
        const supabase = getServiceSupabase()

        // Get the highest order number
        const { data: existing } = await supabase
            .from('categories')
            .select('order')
            .order('order', { ascending: false })
            .limit(1)

        const highestOrder = existing && existing.length > 0 ? existing[0].order : 0

        const { data: category, error } = await supabase
            .from('categories')
            .insert({
                name: body.name,
                description: body.description || null,
                order: body.order ?? highestOrder + 1
            })
            .select()
            .single()

        if (error) {
            throw error
        }

        const mappedCategory = {
            ...category,
            $id: category.id,
            $createdAt: category.created_at
        }

        return NextResponse.json({ category: mappedCategory }, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}
