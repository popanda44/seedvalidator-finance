'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Wallet, Brain, Building2, ChartLine, PieChart, LineChart } from 'lucide-react'
import { motion } from 'framer-motion'

import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { RunwaySimulator } from '@/components/marketing/runway-simulator'
import { FeatureShowcase } from '@/components/marketing/feature-showcase'

export default function HomePage() {
  return (
    <div className="min-h-screen selection:bg-foreground selection:text-background overflow-x-hidden">
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="floating-nav px-2 py-2 flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2 px-4 py-2">
            <div className="h-7 w-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">FinYeld AI</span>
          </Link>
          <div className="hidden md:flex items-center">
            <Link href="#features" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Product
            </Link>
            <Link href="/pricing" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#security" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
            <Link href="/contact" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <Link
            href="/login"
            className="ml-2 px-4 py-2 text-sm font-medium text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

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

      {/* Integrations Section */}
      <section className="py-16 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-8">Seamlessly integrates with your financial stack</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {['Plaid', 'Stripe', 'QuickBooks', 'Salesforce', 'HubSpot', 'Gusto'].map((name) => (
              <div key={name} className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-5 w-5" />
                <span className="font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-emerald-500 rounded-md flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight">FinYeld AI</span>
          </div>

          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </div>

          <p className="text-zinc-600 text-xs">© 2025 FinYeld AI Inc.</p>
        </div>
      </footer>
    </div>
  )
}
