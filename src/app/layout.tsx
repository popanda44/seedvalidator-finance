import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FinYeld AI | Intelligent Financial Analytics for Startups',
  description:
    'AI-powered financial intelligence platform. Real-time analytics, predictive forecasting, and investor-ready insights that maximize your yield.',
  keywords: ['fintech', 'AI analytics', 'startup finance', 'cash flow', 'runway calculator', 'financial intelligence'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <PostHogProvider>{children}</PostHogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
