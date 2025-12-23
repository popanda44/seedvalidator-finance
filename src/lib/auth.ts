import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Provider } from "next-auth/providers"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

// Build providers array - always include OAuth providers
// Credentials are read at runtime from environment variables
const providers: Provider[] = [
    // Google OAuth provider
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // GitHub OAuth provider
    GitHub({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
]

// Add Credentials provider
providers.push(
    Credentials({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null
            }

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
            })

            if (!user || !user.password) {
                return null
            }

            const passwordMatch = await bcrypt.compare(
                credentials.password as string,
                user.password
            )

            if (!passwordMatch) {
                return null
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
            }
        },
    })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers,
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
        async jwt({ token, user, account }) {
            // Initial sign-in - user object is available
            if (user) {
                token.id = user.id
                token.email = user.email

                // For OAuth users, try to get additional user info from database
                // Use email lookup since ID might not be in DB yet during first OAuth
                if (user.email) {
                    try {
                        const dbUser = await prisma.user.findUnique({
                            where: { email: user.email },
                            include: { company: true },
                        })

                        if (dbUser) {
                            token.id = dbUser.id
                            token.role = dbUser.role
                            token.companyId = dbUser.companyId
                            token.companyName = dbUser.company?.name
                        }
                    } catch (error) {
                        console.error('Error fetching user in jwt callback:', error)
                        // Continue with basic token - don't fail the auth
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.role = token.role as string
                session.user.companyId = token.companyId as string
                session.user.companyName = token.companyName as string
            }
            return session
        },
    },
})

// Extend the session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            image?: string | null
            role?: string
            companyId?: string
            companyName?: string
        }
    }
}
