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
  {
    icon: TrendingUp,
    title: 'Smart Forecasting',
    description: 'AI-powered runway predictions',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Live financial insights',
  },
  {
    icon: Zap,
    title: 'Instant Integrations',
    description: 'Connect your tools in seconds',
  },
]

export const AuthSplitLayout = ({
  children,
  heading = 'Welcome back',
  subheading = 'Enter your details to access your account',
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
      {/* LEFT PANEL - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-white/10 blur-[80px] rounded-full"
        />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center">
                <div className="h-2 w-2 bg-primary rounded-full" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SeedValidator</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl xl:text-5xl font-bold text-white leading-tight"
              >
                Know your runway.
                <br />
                <span className="text-white/80">Forecast with confidence.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-white/70 max-w-md"
              >
                The AI-powered FP&A platform trusted by 500+ startups to manage their finances smarter.
              </motion.p>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors cursor-default"
                >
                  <feature.icon className="w-5 h-5 text-white" />
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="text-xs text-white/60">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-medium text-white/90">SOC 2 Type II Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-xs font-medium text-white/90">256-bit Encryption</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[480px] px-6 sm:px-8 lg:px-12 py-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
              <div className="h-5 w-5 bg-background rounded-lg flex items-center justify-center">
                <div className="h-2 w-2 bg-primary rounded-full" />
              </div>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">SeedValidator</span>
          </div>

          {/* Back Link - Desktop only */}
          <Link
            href="/"
            className="hidden lg:flex group mb-10 items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 w-fit"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Back to home</span>
          </Link>

          {/* Header */}
          <div className="space-y-3 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {heading}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {subheading}
            </p>
          </div>

          {/* Form Container */}
          <div className="w-full bg-card/60 backdrop-blur-xl border border-border/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/5">
            {children}
          </div>

          {/* Security Footer */}
          <div className="flex flex-col items-center gap-3 pt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tracking-wide">
                Secured by 256-bit encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
