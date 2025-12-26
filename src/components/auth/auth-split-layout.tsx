'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, TrendingUp, BarChart3, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
  heading?: string
  subheading?: string
}

const features = [
  { icon: TrendingUp, text: 'AI-Powered Forecasting' },
  { icon: BarChart3, text: 'Real-time Analytics' },
  { icon: Zap, text: 'Instant Integrations' },
]

export const AuthSplitLayout = ({
  children,
  heading = 'Welcome back',
  subheading = 'Enter your details to access your account',
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-muted/30 to-transparent" />
      </div>

      {/* Floating Orb - Subtle */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] right-[15%] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full"
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[440px] px-6 py-10">
        {/* Back Link */}
        <Link
          href="/"
          className="group mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all w-fit"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80 group-hover:border-primary/50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        {/* Logo & Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <div className="h-5 w-5 bg-background rounded-lg flex items-center justify-center">
              <div className="h-2 w-2 bg-primary rounded-full" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-foreground tracking-tight">FinYeld AI</span>
            <p className="text-xs text-muted-foreground">Financial Intelligence Platform</p>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h1>
          <p className="text-muted-foreground text-sm">{subheading}</p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-card/70 backdrop-blur-sm border border-border/60 p-6 rounded-2xl shadow-xl shadow-black/5">
          {children}
        </div>

        {/* Trust & Features Section */}
        <div className="mt-8 space-y-4">
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 border border-border/50 rounded-full text-xs text-muted-foreground"
              >
                <feature.icon className="w-3 h-3" />
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Security Badge */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                256-bit SSL Encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
