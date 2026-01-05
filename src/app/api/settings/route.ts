import { NextRequest, NextResponse } from 'next/server'
import { getMenuSettings, updateMenuSettings } from '@/services/orders'

export async function GET() {
    try {
        const settings = await getMenuSettings()

        if (!settings) {
            return NextResponse.json(
                { error: 'Menu settings not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching menu settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch menu settings' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        await updateMenuSettings(body)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating menu settings:', error)
        return NextResponse.json(
            { error: 'Failed to update menu settings' },
            { status: 500 }
        )
    }
}
