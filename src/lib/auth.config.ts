import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth sign-in even for new users (adapter creates them)
            if (account?.provider === 'google' || account?.provider === 'github') {
                return true
            }
            // For credentials, user must already exist
            if (user) {
                return true
            }
            return false
        },
        async redirect({ url, baseUrl }) {
            // Allow relative URLs
            if (url.startsWith('/')) {
                return `${baseUrl}${url}`
            }
            // Allow URLs from same origin
            if (url.startsWith(baseUrl)) {
                return url
            }
            // Default redirect to dashboard
            return `${baseUrl}/dashboard`
        },
        async jwt({ token, user }) {
            // Initial sign-in - user object is available
            if (user) {
                token.id = user.id
                token.email = user.email
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                // These will be populated by the full auth.ts configuration with DB access
                if (token.role) session.user.role = token.role as string
                if (token.companyId) session.user.companyId = token.companyId as string
                if (token.companyName) session.user.companyName = token.companyName as string
            }
            return session
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
