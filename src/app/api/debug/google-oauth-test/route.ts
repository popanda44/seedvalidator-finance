import { NextResponse } from 'next/server'

export async function GET() {
  // Test Google OAuth endpoint directly
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = 'https://potent-fin.vercel.app/api/auth/callback/google'

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')

  return NextResponse.json({
    clientId: clientId?.substring(0, 20) + '...',
    redirectUri,
    authUrl: authUrl.toString(),
    message: 'Click authUrl to test direct Google OAuth',
  })
}
