import { Metadata } from 'next'

export const metadata = {
  title: 'Sign In | FinYeld AI',
  description: 'Sign in to your FinYeld AI account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Pass-through layout. The actual UI is rendered by the AuthSplitLayout component in each page.
  return <>{children}</>
}
