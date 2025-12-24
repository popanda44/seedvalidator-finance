import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { RunwaySimulator } from '@/components/marketing/runway-simulator'
import { AIChatPreview } from '@/components/marketing/ai-chat-preview'
import {
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  Target,
  Sparkles
} from 'lucide-react'

// Testimonials for Infinite Moving Cards
const testimonials = [
  {
    quote: "SeedValidator gave us clarity on our runway that we never had before. It's like having a CFO in your pocket.",
    name: "Sarah Chen",
    title: "Founder, TechFlow",
  },
  {
    quote: "The AI insights are eerily accurate. It predicted our cash crunch two months before it happened.",
    name: "Michael Ross",
    title: "CEO, NexaCorp",
  },
  {
    quote: "Finally, finance software that doesn't feel like a spreadsheet from 1995. Beautiful and functional.",
    name: "Elena Rodriguez",
    title: "CFO, GreenScale",
  },
  {
    quote: "The forecasting tools helped us secure our Series A by showing investors a clear path to profitability.",
    name: "David Kim",
    title: "Founder, StackAI",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-indigo-500/30">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SeedValidator
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-200 font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <BackgroundBeams className="opacity-40" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered Financial Nervous System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Know Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient-x">
                Runway.
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Stop flying blind. SeedValidator connects to your banks, analyzes your burn, and predicts your financial future with military-grade precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="xl" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 shadow-input">
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Live Demo
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 5-min setup
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SOC-2 Compliant
              </div>
            </div>
          </div>

          {/* Interactive Hero Element */}
          <div className="relative perspective-1000">
            <RunwaySimulator />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">Everything you need to survive.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Startup finance isn't just about accounting. It's about survival. Our suite of tools gives you the edge.
          </p>
        </div>

        <BentoGrid className="max-w-6xl mx-auto">
          {/* Main Large Item: AI Insights */}
          <BentoGridItem
            title={<span className="text-xl">AI Financial Analyst</span>}
            description="Ask questions like 'What is my burn rate?' and get instant answers based on real-time data."
            header={<div className="h-full min-h-[10rem] rounded-xl"><AIChatPreview /></div>}
            className="md:col-span-2 md:row-span-2"
            icon={<BotIcon className="h-4 w-4 text-neutral-500" />}
          />

          {/* Smaller Items */}
          <BentoGridItem
            title="Real-time Sync"
            description="Connects with Plaid to sync your bank transactions instantly."
            header={<div className="flex items-center justify-center h-full min-h-[6rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-white/5"><RefreshIcon className="w-10 h-10 text-indigo-400 animate-spin-slow" /></div>}
            className="md:col-span-1"
            icon={<Zap className="h-4 w-4 text-neutral-500" />}
          />

          <BentoGridItem
            title="Burn Rate Alerts"
            description="Get notified immediately when spending spikes unexpectedly."
            header={<div className="flex items-center justify-center h-full min-h-[6rem] bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-white/5"><AlertIcon className="w-10 h-10 text-red-400 animate-pulse" /></div>}
            className="md:col-span-1"
            icon={<Target className="h-4 w-4 text-neutral-500" />}
          />

          <BentoGridItem
            title="Revenue Forecasting"
            description="Project reliable revenue streams with advanced modeling."
            header={<div className="flex items-center justify-center h-full min-h-[6rem] bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl border border-white/5"><TrendIcon className="w-10 h-10 text-emerald-400" /></div>}
            className="md:col-span-3"
            icon={<TrendingUp className="h-4 w-4 text-neutral-500" />}
          />
        </BentoGrid>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 -skew-y-3 transform origin-bottom-left" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Ready to take control?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join the new generation of founders who use data, not gut feeling, to run their companies.
          </p>
          <Link href="/dashboard">
            <Button size="xl" className="bg-white text-indigo-950 hover:bg-indigo-50 shadow-2xl shadow-indigo-500/50 scale-100 hover:scale-105 transition-all duration-300">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}

// Simple icons for Bento
const BotIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
)

const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
)

const TrendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
)
