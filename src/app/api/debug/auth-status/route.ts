import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET /api/debug/auth-status - Check current auth session status
export async function GET() {
    try {
        const session = await auth()

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            authenticated: !!session,
            session: session ? {
                user: {
                    id: session.user?.id,
                    email: session.user?.email,
                    name: session.user?.name,
                    role: session.user?.role,
                },
                expires: session.expires,
            } : null,
        })
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 })
    }
}
