import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET /api/debug/salesforce-url - Show the exact OAuth URL being generated
export async function GET(req: NextRequest) {
    const session = await auth()

    const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID
    const SALESFORCE_URL = process.env.SALESFORCE_URL || 'https://login.salesforce.com'
    const redirectUri = `${req.nextUrl.origin}/api/integrations/salesforce/callback`
    const scopes = ['api', 'refresh_token', 'offline_access']

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: SALESFORCE_CLIENT_ID || 'MISSING',
        redirect_uri: redirectUri,
        scope: scopes.join(' '),
        state: session?.user?.companyId || 'no-company-id',
    })

    const authUrl = `${SALESFORCE_URL}/services/oauth2/authorize?${params.toString()}`

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        hasSession: !!session,
        companyId: session?.user?.companyId || null,
        oauthUrl: authUrl,
        breakdown: {
            baseUrl: `${SALESFORCE_URL}/services/oauth2/authorize`,
            clientId: SALESFORCE_CLIENT_ID ? `${SALESFORCE_CLIENT_ID.substring(0, 15)}...` : 'MISSING',
            redirectUri: redirectUri,
            scopes: scopes.join(' '),
            state: session?.user?.companyId || 'no-company-id',
        },
    })
}
