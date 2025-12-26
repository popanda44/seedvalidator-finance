import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { SALESFORCE_CONFIG, getSalesforceAuthUrl } from '@/lib/salesforce-auth'

// GET /api/debug/salesforce-url - Show the exact OAuth URL being generated
export async function GET(req: NextRequest) {
  const session = await auth()

  const redirectUri = `${req.nextUrl.origin}/api/integrations/salesforce/callback`

  let authUrl = 'Unable to generate - missing companyId'
  if (session?.user?.companyId) {
    authUrl = await getSalesforceAuthUrl(session.user.companyId, redirectUri)
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasSession: !!session,
    companyId: session?.user?.companyId || null,
    oauthUrl: authUrl,
    breakdown: {
      baseUrl: SALESFORCE_CONFIG.authUrl,
      clientId: SALESFORCE_CONFIG.clientId
        ? `${SALESFORCE_CONFIG.clientId.substring(0, 15)}...`
        : 'MISSING',
      redirectUri: redirectUri,
      scopes: SALESFORCE_CONFIG.scopes.join(' '),
      state: session?.user?.companyId || 'no-company-id',
    },
  })
}
