import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Zap,
  Shield,
  Clock,
  DollarSign,
  TrendingUp,
  Building2,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: '5-Minute Setup',
    description: 'Connect your bank accounts and get insights instantly. No complex implementation.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard',
    description: 'See your cash balance, burn rate, and runway updated in real-time.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Get proactive alerts and recommendations powered by machine learning.',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'SOC 2 compliant with end-to-end encryption. Your data is always secure.',
  },
  {
    icon: DollarSign,
    title: 'Startup-Friendly Pricing',
    description: 'Start at $99/month. No long-term contracts. Cancel anytime.',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Forecasting',
    description: 'Project your revenue with simple linear models or custom assumptions.',
  },
]

const metrics = [
  { label: 'Companies using', value: '500+' },
  { label: 'Cash managed', value: '$2B+' },
  { label: 'Time saved weekly', value: '10hrs' },
  { label: 'Customer rating', value: '4.9/5' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                SeedValidator
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Pricing
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Sign In
              </Link>
              <Link href="/dashboard">
                <Button variant="gradient" size="sm">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-8">
              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Trusted by 500+ startups worldwide
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
              Know Your Runway.
              <br />
              <span className="gradient-text">Plan With Confidence.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              The AI-powered FP&A platform that gives you real-time financial visibility,
              automated forecasting, and investor-ready reports — all in 5 minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button variant="gradient" size="xl">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="xl">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to master your finances
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From cash flow visibility to AI-powered forecasting, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join 500+ startups already using SeedValidator to make smarter financial decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="xl" className="bg-white text-blue-600 hover:bg-blue-50">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                5-minute setup
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              SeedValidator Finance
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2024 SeedValidator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
