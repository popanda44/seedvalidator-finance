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
  title: 'SeedValidator Finance | AI-Powered FP&A for Startups',
  description:
    'Real-time financial visibility, automated forecasting, and investor-ready reports. Know your runway. Plan with confidence.',
  keywords: ['startup finance', 'cash flow', 'runway calculator', 'FP&A', 'financial planning'],
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
