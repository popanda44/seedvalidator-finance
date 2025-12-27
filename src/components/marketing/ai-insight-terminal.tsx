'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const insights = [
    {
        text: "Analyzing your Stripe revenue data...",
        result: "Revenue up 23% MoM. Growth trajectory is healthy.",
    },
    {
        text: "Scanning expense patterns from Plaid...",
        result: "Your runway extended by 2.3 months based on reduced SaaS spend.",
    },
    {
        text: "Comparing burn rate to similar startups...",
        result: "Your burn efficiency is in the top 20% for Series A companies.",
    },
    {
        text: "Forecasting next quarter cash position...",
        result: "Projected cash balance: $847K. Consider raising by Q3.",
    },
    {
        text: "Detecting spending anomalies...",
        result: "Unusual spike in marketing spend (+34%). Review recommended.",
    },
]

export function AIInsightTerminal() {
    const [currentInsight, setCurrentInsight] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [phase, setPhase] = useState<'typing' | 'result' | 'pause'>('typing')
    const [showCursor, setShowCursor] = useState(true)

    // Cursor blink effect
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 530)
        return () => clearInterval(interval)
    }, [])

    // Typing animation
    useEffect(() => {
        const insight = insights[currentInsight]

        if (phase === 'typing') {
            const text = insight.text
            let index = 0
            const typingInterval = setInterval(() => {
                if (index < text.length) {
                    setDisplayText(text.substring(0, index + 1))
                    index++
                } else {
                    clearInterval(typingInterval)
                    setTimeout(() => setPhase('result'), 500)
                }
            }, 35)
            return () => clearInterval(typingInterval)
        }

        if (phase === 'result') {
            setDisplayText(insight.result)
            const timeout = setTimeout(() => setPhase('pause'), 3000)
            return () => clearTimeout(timeout)
        }

        if (phase === 'pause') {
            const timeout = setTimeout(() => {
                setCurrentInsight((prev) => (prev + 1) % insights.length)
                setDisplayText('')
                setPhase('typing')
            }, 800)
            return () => clearTimeout(timeout)
        }
    }, [phase, currentInsight])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                'relative max-w-xl mx-auto rounded-2xl overflow-hidden',
                'bg-zinc-950 dark:bg-zinc-900',
                'border border-zinc-800',
                'shadow-2xl shadow-black/20'
            )}
        >
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex items-center justify-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs text-zinc-500 font-mono">FinYeld AI Console</span>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>

            {/* Terminal Content */}
            <div className="p-5 min-h-[140px] font-mono text-sm">
                {/* Command prompt */}
                <div className="flex items-start gap-2 text-zinc-400 mb-3">
                    <span className="text-emerald-500">▶</span>
                    <span className="text-zinc-500">finyeld analyze --realtime</span>
                </div>

                {/* Dynamic insight */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentInsight}-${phase}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2"
                    >
                        <span className={cn(
                            phase === 'result' ? 'text-emerald-500' : 'text-blue-400'
                        )}>
                            {phase === 'result' ? '✓' : '●'}
                        </span>
                        <span className={cn(
                            phase === 'result' ? 'text-emerald-400' : 'text-zinc-300'
                        )}>
                            {displayText}
                            {phase === 'typing' && (
                                <span className={cn(
                                    'inline-block w-2 h-4 ml-0.5 -mb-0.5 bg-emerald-500',
                                    showCursor ? 'opacity-100' : 'opacity-0'
                                )} />
                            )}
                        </span>
                    </motion.div>
                </AnimatePresence>

                {/* Progress dots */}
                <div className="flex items-center gap-1.5 mt-6">
                    {insights.map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                                index === currentInsight
                                    ? 'bg-emerald-500 w-4'
                                    : 'bg-zinc-700'
                            )}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
