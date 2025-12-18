import { NextResponse } from 'next/server'

// POST /api/plaid/sync - Manually trigger a sync
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { companyId } = body

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID is required' },
                { status: 400 }
            )
        }

        // Return mock sync for development (database queries will be added when DB is connected)
        return NextResponse.json({
            success: true,
            isDevelopment: true,
            syncedAt: new Date().toISOString(),
            summary: {
                transactionsAdded: 5,
                transactionsModified: 2,
                transactionsRemoved: 0,
                accountsUpdated: 2,
            },
            message: 'Sync completed successfully',
        })
    } catch (error: any) {
        console.error('Manual sync error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to sync' },
            { status: 500 }
        )
    }
}
