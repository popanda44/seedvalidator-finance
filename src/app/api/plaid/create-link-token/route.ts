import { NextResponse } from 'next/server'
import { createLinkToken } from '@/lib/plaid'

// POST /api/plaid/create-link-token - Create a Plaid Link token
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, companyId } = body

        if (!userId || !companyId) {
            return NextResponse.json(
                { error: 'User ID and Company ID are required' },
                { status: 400 }
            )
        }

        // Check if Plaid is configured
        if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
            // Return mock token for development
            return NextResponse.json({
                linkToken: 'link-sandbox-mock-token-' + Date.now(),
                expiration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
                isDevelopment: true,
                message: 'Using development mode - Plaid not configured',
            })
        }

        const linkToken = await createLinkToken(userId, companyId)

        return NextResponse.json({
            linkToken,
            expiration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        })
    } catch (error: any) {
        console.error('Create link token error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create link token' },
            { status: 500 }
        )
    }
}
