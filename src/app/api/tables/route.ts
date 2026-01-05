import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = getServiceSupabase()
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .order('number', { ascending: true })

        if (error) throw error

        const tables = data.map((t: any) => ({
            id: t.id,
            number: t.number,
            name: t.name,
            seats: t.seats,
            isActive: t.is_active,
            qrCode: t.qr_code,
            status: t.status || 'available',
            createdAt: t.created_at
        }))

        return NextResponse.json(tables)
    } catch (error) {
        console.error('Error fetching tables:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tables' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = getServiceSupabase()

        const { data, error } = await supabase
            .from('tables')
            .insert({
                number: body.number,
                name: body.name || null,
                seats: body.seats || 4,
                is_active: body.isActive !== false,
                qr_code: body.qrCode || null,
                status: body.status || 'available'
            })
            .select()
            .single()

        if (error) throw error

        const table = {
            id: data.id,
            number: data.number,
            name: data.name,
            seats: data.seats,
            isActive: data.is_active,
            qrCode: data.qr_code,
            status: data.status,
            createdAt: data.created_at
        }

        return NextResponse.json(table, { status: 201 })
    } catch (error) {
        console.error('Error creating table:', error)
        return NextResponse.json(
            { error: 'Failed to create table' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updateData } = body
        const supabase = getServiceSupabase()

        if (!id) {
            return NextResponse.json(
                { error: 'Table ID is required' },
                { status: 400 }
            )
        }

        const dbData: any = {}
        if (updateData.number !== undefined) dbData.number = updateData.number
        if (updateData.name !== undefined) dbData.name = updateData.name
        if (updateData.seats !== undefined) dbData.seats = updateData.seats
        if (updateData.isActive !== undefined) dbData.is_active = updateData.isActive
        if (updateData.qrCode !== undefined) dbData.qr_code = updateData.qrCode
        if (updateData.status !== undefined) dbData.status = updateData.status

        const { data, error } = await supabase
            .from('tables')
            .update(dbData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        const table = {
            id: data.id,
            number: data.number,
            name: data.name,
            seats: data.seats,
            isActive: data.is_active,
            qrCode: data.qr_code,
            status: data.status,
            createdAt: data.created_at
        }

        return NextResponse.json(table)
    } catch (error) {
        console.error('Error updating table:', error)
        return NextResponse.json(
            { error: 'Failed to update table' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Table ID is required' },
                { status: 400 }
            )
        }

        const supabase = getServiceSupabase()
        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting table:', error)
        return NextResponse.json(
            { error: 'Failed to delete table' },
            { status: 500 }
        )
    }
}
