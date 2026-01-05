import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats, getReportsByDateRange } from '@/services/orders'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'stats'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        if (type === 'stats') {
            const stats = await getDashboardStats()
            return NextResponse.json(stats)
        }

        if (type === 'range' && startDate && endDate) {
            const reports = await getReportsByDateRange(startDate, endDate)
            return NextResponse.json(reports)
        }

        return NextResponse.json(
            { error: 'Invalid report type or missing date range' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        )
    }
}
