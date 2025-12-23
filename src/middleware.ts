import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
]

// Routes that should redirect to dashboard if already logged in
const authRoutes = [
    '/login',
    '/register',
]

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    // Check if route requires authentication
    const isProtectedRoute = protectedRoutes.some(route =>
        nextUrl.pathname.startsWith(route)
    )

    // Check if route is an auth route (login/register)
    const isAuthRoute = authRoutes.some(route =>
        nextUrl.pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl)
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect to dashboard if accessing auth routes with active session
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }

    return NextResponse.next()
})

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
