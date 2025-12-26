'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PlaidLinkDemoButton } from '@/components/plaid/plaid-link-button'
import {
  Sparkles,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userName?: string
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to FinYeld AI',
    description: 'Your AI-powered financial command center for startups.',
  },
  {
    id: 'company',
    title: 'Tell us about your company',
    description: 'This helps us personalize your experience.',
  },
  {
    id: 'bank',
    title: 'Connect your bank',
    description: 'Securely link your accounts for real-time insights.',
  },
  {
    id: 'done',
    title: "You're all set!",
    description: 'Start exploring your financial dashboard.',
  },
]

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  userName = 'there',
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [companyData, setCompanyData] = useState({
    name: '',
    stage: '',
    industry: '',
  })
  const [bankConnected, setBankConnected] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBankConnected = () => {
    setBankConnected(true)
    setTimeout(() => {
      handleNext()
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Hey {userName}! 👋</h2>
                <p className="text-muted-foreground mb-8">
                  Welcome to FinYeld AI, your AI-powered financial command center. Let&apos;s get
                  you set up in under 2 minutes.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-secondary/50 text-center">
                    <Wallet className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Track Cash</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 text-center">
                    <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Forecast Runway</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50 text-center">
                    <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">AI Insights</p>
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Company Info */}
            {currentStep === 1 && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{steps[1].title}</h2>
                <p className="text-muted-foreground mb-6">{steps[1].description}</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Stage</label>
                    <select
                      value={companyData.stage}
                      onChange={(e) => setCompanyData({ ...companyData, stage: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="">Select stage...</option>
                      <option value="pre-seed">Pre-seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="series-c">Series C+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Industry
                    </label>
                    <select
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="">Select industry...</option>
                      <option value="saas">SaaS</option>
                      <option value="fintech">Fintech</option>
                      <option value="healthtech">Healthtech</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Connect Bank */}
            {currentStep === 2 && (
              <motion.div
                key="bank"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{steps[2].title}</h2>
                <p className="text-muted-foreground mb-6">{steps[2].description}</p>

                {bankConnected ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium">Bank connected successfully!</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Bank-level security</p>
                          <p className="text-sm text-muted-foreground">
                            We use Plaid to securely connect your accounts. We never store your
                            credentials.
                          </p>
                        </div>
                      </div>
                    </div>

                    <PlaidLinkDemoButton onSuccess={handleBankConnected} className="w-full mb-4">
                      <Building2 className="w-4 h-4 mr-2" />
                      Connect Bank Account
                    </PlaidLinkDemoButton>
                  </>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button variant="ghost" onClick={handleNext} className="flex-1">
                    Skip for now
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Done */}
            {currentStep === 3 && (
              <motion.div
                key="done"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{steps[3].title}</h2>
                <p className="text-muted-foreground mb-8">{steps[3].description}</p>

                <div className="space-y-3 text-left bg-secondary/50 rounded-xl p-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-foreground">Account created</span>
                  </div>
                  {companyData.name && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm text-foreground">Company: {companyData.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {bankConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">
                      Bank account {bankConnected ? 'connected' : '(connect later)'}
                    </span>
                  </div>
                </div>

                <Button onClick={onComplete} className="w-full">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicators */}
        <div className="px-8 pb-6">
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-secondary'
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
