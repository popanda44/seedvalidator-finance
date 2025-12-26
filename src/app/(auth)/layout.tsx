import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication | SeedValidator Finance',
  description: 'Sign in to your SeedValidator Finance account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Pass-through layout. The actual UI is rendered by the AuthSplitLayout component in each page.
  return <>{children}</>
}
