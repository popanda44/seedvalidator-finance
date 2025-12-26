import { NextResponse } from 'next/server'

// GET /api/debug/salesforce-config - Check Salesforce configuration (without secrets)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasClientId: !!process.env.SALESFORCE_CLIENT_ID,
      clientIdPrefix: process.env.SALESFORCE_CLIENT_ID?.substring(0, 10) + '...',
      hasClientSecret: !!process.env.SALESFORCE_CLIENT_SECRET,
      salesforceUrl: process.env.SALESFORCE_URL || 'https://login.salesforce.com (default)',
      appUrl:
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.AUTH_URL ||
        'https://potent-fin.vercel.app (fallback)',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'https://potent-fin.vercel.app'}/api/integrations/salesforce/callback`,
    },
  })
}
