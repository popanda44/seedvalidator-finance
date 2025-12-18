import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
]

// Routes that should redirect to dashboard if already logged in
const authRoutes = [
    '/login',
    '/register',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    // Check if route is an auth route (login/register)
    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    )

    // Skip middleware for non-protected and non-auth routes
    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next()
    }

    // Check if auth secrets are configured
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

    // If no secret is configured, allow all access (development mode)
    if (!secret) {
        console.warn('Auth secrets not configured - allowing unrestricted access')
        return NextResponse.next()
    }

    try {
        // Get session token
        const token = await getToken({
            req: request,
            secret,
        })

        // Redirect to login if accessing protected route without session
        if (isProtectedRoute && !token) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Redirect to dashboard if accessing auth routes with active session
        if (isAuthRoute && token) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    } catch (error) {
        // If there's an error checking the session, allow access to auth routes
        // but redirect protected routes to login
        console.error('Middleware auth error:', error)
        if (isProtectedRoute) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}


