'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Wallet, Brain, Building2, ChartLine, PieChart, LineChart } from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { RunwaySimulator } from '@/components/marketing/runway-simulator'
import { FeatureShowcase } from '@/components/marketing/feature-showcase'
import { AgentShowcase } from '@/components/marketing/agent-showcase'
import { AIInsightTerminal } from '@/components/marketing/ai-insight-terminal'
import { IntegrationPulse } from '@/components/marketing/integration-pulse'
import { ComparisonTable } from '@/components/marketing/comparison-table'
import { MobileMenuPanel, HamburgerIcon, useMobileMenu } from '@/components/layout/mobile-menu'
import { CreativeThemeToggle } from '@/components/ui/creative-theme-toggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#features', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '#security', label: 'Security' },
  { href: '/contact', label: 'Contact' },
]

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('')
  const mobileMenu = useMobileMenu()

  // Track scroll position for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Update active section based on scroll position
      const sections = ['features', 'security', 'testimonials']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveLink(`#${section}`)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen selection:bg-foreground selection:text-background overflow-x-hidden">
      {/* Enhanced Sticky Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 inset-x-0 z-40 p-4 md:p-6',
          'flex justify-between items-center',
          'transition-all duration-500 ease-out',
          isScrolled && 'p-3 md:p-4'
        )}
      >
        {/* Animated Background - appears on scroll */}
        <motion.div
          className={cn(
            'absolute inset-x-4 md:inset-x-6 top-2 bottom-2 rounded-2xl',
            'bg-white/80 dark:bg-zinc-900/85',
            'backdrop-blur-xl backdrop-saturate-150',
            'border border-zinc-200/50 dark:border-zinc-800/50',
            'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]',
            'transition-all duration-500 ease-out'
          )}
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{
            opacity: isScrolled ? 1 : 0,
            scale: isScrolled ? 1 : 0.98,
            y: isScrolled ? 0 : -10
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Left: Brand Logo with shrink effect */}
        <Link
          href="/"
          className={cn(
            'relative z-10 flex items-center gap-3 px-4 py-2',
            'rounded-full transition-all duration-300 group',
            !isScrolled && 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md'
          )}
        >
          <motion.div
            className="relative rounded-xl overflow-hidden flex-shrink-0 shadow-sm"
            animate={{
              width: isScrolled ? 32 : 40,
              height: isScrolled ? 32 : 40,
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/logo.png"
              alt="FinYeld AI"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </motion.div>
          <motion.span
            className="font-bold text-foreground tracking-tight"
            animate={{
              fontSize: isScrolled ? '1.125rem' : '1.25rem',
            }}
            transition={{ duration: 0.3 }}
          >
            FinYeld AI
          </motion.span>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <div className={cn(
          'relative z-10 hidden md:flex items-center gap-1 px-2 py-1.5',
          !isScrolled && 'floating-nav'
        )}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
                activeLink === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
              {/* Animated underline indicator */}
              {activeLink === link.href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-emerald-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right: Auth CTA + Theme Toggle + Mobile Menu */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Theme Toggle - Desktop */}
          <div className="hidden md:block">
            <CreativeThemeToggle />
          </div>

          {/* Desktop Sign In */}
          <Link
            href="/login"
            className={cn(
              'hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-medium',
              'text-white bg-foreground rounded-full',
              'hover:opacity-90 transition-opacity',
              'shadow-lg shadow-emerald-500/20'
            )}
          >
            Sign In
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile Hamburger Menu */}
          <HamburgerIcon
            isOpen={mobileMenu.isOpen}
            onClick={mobileMenu.toggle}
          />
        </div>
      </motion.nav>

      {/* Mobile Menu Panel */}
      <MobileMenuPanel isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />

      {/* Hero Section with Cloud Gradient */}
      <section className="cloud-gradient-bg relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Credibility Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 credibility-badge mb-8"
          >
            <Shield className="h-4 w-4" />
            <span>SOC-2 Compliant • Bank-Grade Security</span>
          </motion.div>

          {/* Main Headline - Serif Style */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="serif-heading text-5xl sm:text-6xl md:text-7xl text-foreground mb-6"
          >
            AI-Powered Financial
            <br />
            <span className="gradient-text">Intelligence for Startups</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop guessing your runway. FinYeld AI connects to your bank accounts
            and creates intelligent financial models that predict, optimize, and
            yield results—seamlessly.
          </motion.p>

          {/* Single Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/register"
              className="pill-button inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-emerald-400 to-teal-500"
                    style={{ opacity: 1 - i * 0.1 }}
                  />
                ))}
              </div>
              <span>500+ founders trust us</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span>$2B+ in runway analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span>99.9% uptime SLA</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section - Inspired by Reference */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-4">
              How Startups Use FinYeld AI
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real use cases from founders and finance teams who rely on our
              platform to make smarter financial decisions.
            </p>
          </div>

          {/* Use Case Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 - Runway Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="use-case-card p-6"
            >
              <div className="feature-icon mb-4">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Runway Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">Seed & Series A</p>
              <p className="text-muted-foreground">
                Automatically calculate your runway across multiple scenarios.
                Know exactly when you need to raise and how much, with AI-powered
                forecasting that updates in real-time.
              </p>
            </motion.div>

            {/* Card 2 - Burn Rate Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="use-case-card p-6"
            >
              <div className="feature-icon mb-4">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Burn Optimization</h3>
              <p className="text-sm text-muted-foreground mb-4">Growth Stage</p>
              <p className="text-muted-foreground">
                Identify spending anomalies and optimize your burn rate with
                AI insights. Get alerts before expenses spiral and track every
                dollar with precision.
              </p>
            </motion.div>

            {/* Card 3 - AI CFO Briefings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="use-case-card p-6"
            >
              <div className="feature-icon mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">AI CFO Briefings</h3>
              <p className="text-sm text-muted-foreground mb-4">All Stages</p>
              <p className="text-muted-foreground">
                Wake up to AI-generated financial briefings. Get executive
                summaries, anomaly alerts, and scenario analysis—like having
                a CFO on autopilot.
              </p>
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-3 mt-8">
            <button className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* AI Insight Terminal - Live Demo */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-zinc-50/30 to-background dark:via-zinc-950/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              See FinYeld AI in Action
            </h3>
            <p className="text-muted-foreground">
              Watch how our AI analyzes your financial data in real-time
            </p>
          </motion.div>
          <AIInsightTerminal />
        </div>
      </section>

      {/* Live Demo Section - Runway Simulator */}
      <section id="demo" className="py-24 px-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="credibility-badge inline-flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4" />
              Interactive Demo
            </span>
            <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-4">
              Try the Runway Simulator
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how FinYeld AI calculates your startup runway in real-time.
              Adjust the parameters and watch the magic happen.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <RunwaySimulator />
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section
        id="features"
        className="py-24 px-4 bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">
              <Zap className="mr-2 h-3.5 w-3.5" />
              Powerful Features
            </div>
            <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-4">
              Why founders love FinYeld AI
            </h2>
            <p className="text-muted-foreground text-lg">
              We&apos;ve combined the speed of a spreadsheet with the power of a financial engine.
            </p>
          </div>

          <FeatureShowcase />
        </div>
      </section>

      {/* Integrations Section - Animated Pulse */}
      <IntegrationPulse />

      {/* AI Agent Showcase */}
      <AgentShowcase />

      {/* Testimonials */}
      <section id="testimonials" className="py-24 overflow-hidden bg-background">
        <div className="text-center mb-12">
          <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-4">
            Trusted by Leading Founders
          </h2>
          <p className="text-muted-foreground">What our users are saying</p>
        </div>
        <InfiniteMovingCards
          items={[
            {
              quote: "FinYeld AI clarified our burn rate instantly. It's concise and powerful.",
              name: 'Alex Chen',
              title: 'Founder, NexaAI',
            },
            {
              quote: 'The only financial tool that feels like it was built for engineers.',
              name: 'Sarah Jones',
              title: 'CTO, DevFlow',
            },
            {
              quote: 'I stopped using Excel for runway projections. This is just better.',
              name: 'Mark Davis',
              title: 'CEO, GrowthRocket',
            },
            {
              quote: 'Clean, fast, and verified. exactly what VCs want to see.',
              name: 'Emily Wilson',
              title: 'Partner, SeedFund',
            },
          ]}
          direction="left"
          speed="slow"
        />
      </section>

      {/* Comparison Table - Why Choose FinYeld */}
      <ComparisonTable />

      {/* Security Section */}
      <section id="security" className="py-24 px-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <span className="credibility-badge inline-flex items-center gap-2 mb-6">
            <Shield className="h-4 w-4" />
            Enterprise-Grade Security
          </span>
          <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-6">
            Your Financial Data is Safe
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Bank-level encryption, SOC-2 compliance, and zero-trust architecture.
            We take security as seriously as you do.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="use-case-card p-6 text-center">
              <div className="feature-icon mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">AES-256 Encryption</h3>
              <p className="text-sm text-muted-foreground">Data encrypted at rest and in transit</p>
            </div>
            <div className="use-case-card p-6 text-center">
              <div className="feature-icon mx-auto mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">SOC-2 Type II</h3>
              <p className="text-sm text-muted-foreground">Audited security controls</p>
            </div>
            <div className="use-case-card p-6 text-center">
              <div className="feature-icon mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">99.9% Uptime SLA</h3>
              <p className="text-sm text-muted-foreground">Enterprise reliability guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-white text-[10vw] md:text-[8vw] font-bold tracking-tighter leading-none opacity-90 select-none">
            YIELD
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 -mt-4 md:-mt-8 mb-12">
            <h2 className="text-emerald-500/50 text-[10vw] md:text-[8vw] font-bold tracking-tighter leading-none select-none">
              MORE
            </h2>
          </div>

          <div className="max-w-xl mx-auto space-y-8">
            <p className="text-zinc-400 text-lg md:text-xl font-light">
              Join the new standard of financial modeling. <br />
              Predictable. Precise. Powerful.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-black hover:bg-zinc-200 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-transparent px-10 text-lg font-medium text-white hover:bg-white/10 transition-colors"
              >
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced Branding */}
      <footer className="bg-black py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-10 w-10 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="FinYeld AI"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-white text-xl font-bold tracking-tight">FinYeld AI</span>
              </div>
              <p className="text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
                AI-powered financial intelligence for startups. Know your runway,
                forecast with confidence, and make smarter decisions with real-time insights.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="https://twitter.com/finyeldai" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://linkedin.com/company/finyeldai" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="https://github.com/finyeldai" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                </a>
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm">© 2025 FinYeld AI Inc. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                SOC-2 Compliant
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                99.9% Uptime
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
