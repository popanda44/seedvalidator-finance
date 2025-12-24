"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, BarChart3, Lock, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { RunwaySimulator } from "@/components/marketing/runway-simulator";
import { AIChatPreview } from "@/components/marketing/ai-chat-preview";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-foreground selection:text-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="h-8 w-8 bg-foreground rounded-full flex items-center justify-center group-hover:bg-foreground/90 transition-colors">
                  <div className="h-3 w-3 bg-background rounded-full" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">SeedValidator</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen max-h-[1080px] flex items-center">
        <BackgroundBeams className="opacity-40" />

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-flex items-center space-x-2 border border-white/10 rounded-full px-3 py-1 mb-6 bg-white/5 backdrop-blur-sm animate-fade-in-delayed">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">SOC-2 Compliant Financial Engine</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-foreground mb-6 leading-[1.1]">
              The Financial <br />
              <span className="text-muted-foreground">Nervous System.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Stop manually updating spreadsheets. SeedValidator connects to your bank accounts to create a living, breathing financial model that updates in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-8 text-sm font-medium text-background shadow transition-all hover:bg-foreground/90 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                Start Validation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:border-foreground/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                View Live Demo
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-zinc-800" />
                ))}
              </div>
              <p>Trusted by 500+ founders</p>
            </div>
          </motion.div>

          {/* Interactive Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative perspective-1000"
          >
            <div className="transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-in-out">
              <RunwaySimulator />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 dark:bg-zinc-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">Everything you need to validate</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial tools designed for the modern founder. No fluff, just data.
            </p>
          </div>

          <BentoGrid>
            <BentoGridItem
              title="Real-time Cash Flow"
              description="Connect via Plaid for instant, verified bank balances and transaction categorization."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center"><BarChart3 className="h-10 w-10 text-neutral-500" /></div>}
              icon={<Zap className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title="AI-Powered Insights"
              description="Ask questions about your finances and get instant, data-backed answers."
              header={<AIChatPreview />}
              icon={<MessageSquare className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-2"
            />
            <BentoGridItem
              title="Bank-Grade Security"
              description="Your data is encrypted with AES-256 and SOC-2 compliant protocols."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center"><Lock className="h-10 w-10 text-neutral-500" /></div>}
              icon={<Lock className="h-4 w-4 text-neutral-500" />}
              className="md:col-span-1"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 overflow-hidden bg-background">
        <InfiniteMovingCards
          items={[
            { quote: "SeedValidator clarified our burn rate instantly. It's concise and brutal.", name: "Alex Chen", title: "Founder, NexaAI" },
            { quote: "The only financial tool that feels like it was built for engineers.", name: "Sarah Jones", title: "CTO, DevFlow" },
            { quote: "I stopped using Excel for runway projections. This is just better.", name: "Mark Davis", title: "CEO, GrowthRocket" },
            { quote: "Clean, fast, and verified. exactly what VCs want to see.", name: "Emily Wilson", title: "Partner, SeedFund" },
          ]}
          direction="left"
          speed="slow"
        />
      </section>

      {/* Mega CTA Section */}
      <section className="relative py-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-white text-[12vw] font-bold tracking-tighter leading-none opacity-90 select-none">
            VALIDATE
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 -mt-4 md:-mt-12 mb-12">
            <h2 className="text-zinc-500 text-[12vw] font-bold tracking-tighter leading-none opacity-50 select-none">
              NOW
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
                Start Validation
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
            <div className="h-6 w-6 bg-white rounded-md"></div>
            <span className="text-white font-bold tracking-tight">SeedValidator</span>
          </div>

          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          </div>

          <p className="text-zinc-600 text-xs">
            © 2025 SeedValidator Inc.
          </p>
        </div>
      </footer>
    </div>
  )
}
