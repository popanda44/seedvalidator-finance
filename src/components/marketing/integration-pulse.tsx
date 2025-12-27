'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const integrations = [
    { name: 'Plaid', delay: 0 },
    { name: 'Stripe', delay: 0.3 },
    { name: 'QuickBooks', delay: 0.6 },
]

function DataPulse({ delay }: { delay: number }) {
    return (
        <motion.div
            className="absolute w-2 h-2 rounded-full bg-emerald-500"
            initial={{ x: -20, opacity: 0 }}
            animate={{
                x: [0, 60, 120],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut',
            }}
        />
    )
}

export function IntegrationPulse() {
    return (
        <section className="py-20 px-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-border overflow-hidden">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className="text-sm text-muted-foreground mb-2">Seamless Data Flow</p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
                        Your Data, <span className="gradient-text">Unified</span>
                    </h3>
                </motion.div>

                {/* Integration Flow Diagram */}
                <div className="relative flex items-center justify-center gap-4 md:gap-8">
                    {/* Left side - Integration logos */}
                    <div className="flex flex-col gap-4">
                        {integrations.map((integration, index) => (
                            <motion.div
                                key={integration.name}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    'relative flex items-center gap-3 px-4 py-3 rounded-xl',
                                    'bg-white dark:bg-zinc-900',
                                    'border border-zinc-200 dark:border-zinc-800',
                                    'shadow-sm'
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {integration.name.charAt(0)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-foreground hidden sm:block">
                                    {integration.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Center - Flow lines with animated pulses */}
                    <div className="relative w-32 md:w-48 h-40">
                        {/* Flow lines */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160">
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
                                    <stop offset="50%" stopColor="hsl(152 76% 36%)" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="hsl(152 76% 36%)" />
                                </linearGradient>
                            </defs>
                            {/* Three converging lines */}
                            <path d="M 0 20 Q 100 40, 200 80" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" />
                            <path d="M 0 80 Q 100 80, 200 80" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" />
                            <path d="M 0 140 Q 100 120, 200 80" fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="4 4" />
                        </svg>

                        {/* Animated pulses */}
                        {integrations.map((integration, index) => (
                            <div
                                key={`pulse-${index}`}
                                className="absolute left-0"
                                style={{ top: `${20 + index * 60}px` }}
                            >
                                <DataPulse delay={integration.delay} />
                            </div>
                        ))}
                    </div>

                    {/* Right side - FinYeld AI Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className={cn(
                            'relative flex flex-col items-center gap-3 p-6 rounded-2xl',
                            'bg-white dark:bg-zinc-900',
                            'border-2 border-emerald-500/30',
                            'shadow-lg shadow-emerald-500/10'
                        )}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 pointer-events-none" />

                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                            <Image
                                src="/logo.png"
                                alt="FinYeld AI"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-foreground">FinYeld AI</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground">Processing</span>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-8 md:gap-16 mt-12 text-center"
                >
                    <div>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">Real-time</p>
                        <p className="text-sm text-muted-foreground">Data Sync</p>
                    </div>
                    <div>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">256-bit</p>
                        <p className="text-sm text-muted-foreground">Encryption</p>
                    </div>
                    <div>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">99.9%</p>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
