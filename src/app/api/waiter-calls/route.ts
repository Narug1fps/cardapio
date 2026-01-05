import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const supabase = getServiceSupabase()

        let query = supabase
            .from('waiter_calls')
            .select('*')
            .order('created_at', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching waiter calls:', error)
        return NextResponse.json(
            { error: 'Failed to fetch waiter calls' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = getServiceSupabase()

        const { data, error } = await supabase
            .from('waiter_calls')
            .insert({
                table_number: body.tableNumber,
                type: body.type,
                customer_name: body.customerName,
                notes: body.notes,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Error creating waiter call:', error)
        return NextResponse.json(
            { error: 'Failed to create waiter call' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = getServiceSupabase()

        if (!body.id || !body.status) {
            return NextResponse.json(
                { error: 'ID and Status are required' },
                { status: 400 }
            )
        }

        const updateData: any = { status: body.status }

        // Add timestamps if columns exist (requires schema update)
        if (body.status === 'acknowledged') {
            updateData.acknowledged_at = new Date().toISOString()
        } else if (body.status === 'completed') {
            updateData.completed_at = new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('waiter_calls')
            .update(updateData)
            .eq('id', body.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating waiter call:', error)
        return NextResponse.json(
            { error: 'Failed to update waiter call' },
            { status: 500 }
        )
    }
}
