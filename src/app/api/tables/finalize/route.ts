import { NextRequest, NextResponse } from 'next/server'
import { finalizeTable } from '@/services/orders'

export async function POST(request: NextRequest) {
    try {
        const { tableNumber } = await request.json()

        if (!tableNumber) {
            return NextResponse.json(
                { error: 'Table number is required' },
                { status: 400 }
            )
        }

        await finalizeTable(tableNumber)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error finalizing table:', error)
        return NextResponse.json(
            { error: 'Failed to finalize table' },
            { status: 500 }
        )
    }
}
