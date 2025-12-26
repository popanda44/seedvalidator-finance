import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, storeSalesforceCredentials } from '@/lib/salesforce-auth'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // This is our companyId
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard/integrations?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard/integrations?error=missing_code_or_state`
    )
  }

  try {
    // Must match the redirect URI used in the auth request
    const redirectUri = `${req.nextUrl.origin}/api/integrations/salesforce/callback`
    const tokens = await exchangeCodeForToken(code, redirectUri)
    await storeSalesforceCredentials(state, tokens)

    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard/integrations?success=salesforce_connected`
    )
  } catch (error) {
    console.error('Salesforce callback error:', error)
    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard/integrations?error=authentication_failed`
    )
  }
}
