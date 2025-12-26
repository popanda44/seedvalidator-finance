'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Github,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AuthSplitLayout } from '@/components/auth/auth-split-layout'

const features = [
  'Real-time cash flow tracking',
  '12+ month runway forecasting',
  'Investor-ready reports',
  'AI-powered insights',
]

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  })
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setStep('success')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setFormError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl: '/dashboard' })
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Welcome aboard!</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Your account has been successfully created. You're ready to take control of your
            startup finances.
          </p>
          <Link href="/login">
            <Button className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <AuthSplitLayout
      heading="Start your free trial"
      subheading="No credit card required • 14-day free trial"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Error Display */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{formError}</span>
          </motion.div>
        )}

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 text-foreground transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-semibold">Google</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 text-foreground transition-all duration-200 disabled:opacity-50"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm font-semibold">GitHub</span>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-sm text-muted-foreground font-medium">
              or register with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full bg-secondary/50 border border-input rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Company</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Acme Inc."
                  required
                  className="w-full bg-secondary/50 border border-input rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                required
                className="w-full bg-secondary/50 border border-input rounded-2xl pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-foreground">Create Password</label>
              <span className="text-xs text-muted-foreground">Min. 8 characters</span>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                required
                minLength={8}
                className="w-full bg-secondary/50 border border-input rounded-2xl pl-12 pr-12 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start free trial
                </>
              )}
            </Button>
          </motion.div>
        </form>

        {/* Features List */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            What's included:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {feature}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-base text-muted-foreground pt-2">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthSplitLayout>
  )
}
