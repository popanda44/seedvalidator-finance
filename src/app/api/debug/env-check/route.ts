import { NextResponse } from 'next/server'

// GET /api/debug/env-check - Check if OAuth env vars are configured (without exposing secrets)
export async function GET() {
  const envStatus = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
      ? `SET (starts with: ${process.env.GOOGLE_CLIENT_ID.substring(0, 12)}...)`
      : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      ? `SET (length: ${process.env.GOOGLE_CLIENT_SECRET.length})`
      : 'NOT SET',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT SET',
    AUTH_URL: process.env.AUTH_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID
      ? `SET (starts with: ${process.env.PLAID_CLIENT_ID.substring(0, 8)}...)`
      : 'NOT SET',
    PLAID_SECRET: process.env.PLAID_SECRET
      ? `SET (length: ${process.env.PLAID_SECRET.length})`
      : 'NOT SET',
    PLAID_ENV: process.env.PLAID_ENV || 'NOT SET',
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: envStatus,
  })
}
