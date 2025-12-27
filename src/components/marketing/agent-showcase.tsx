'use client'

import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Bell, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentCardProps {
    icon: React.ReactNode
    name: string
    role: string
    description: string
    color: 'emerald' | 'blue' | 'amber'
    delay?: number
}

const colorVariants = {
    emerald: {
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        glow: 'group-hover:shadow-emerald-500/20',
        border: 'group-hover:border-emerald-500/30',
        accent: 'bg-emerald-500',
    },
    blue: {
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        glow: 'group-hover:shadow-blue-500/20',
        border: 'group-hover:border-blue-500/30',
        accent: 'bg-blue-500',
    },
    amber: {
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        glow: 'group-hover:shadow-amber-500/20',
        border: 'group-hover:border-amber-500/30',
        accent: 'bg-amber-500',
    },
}

function AgentCard({ icon, name, role, description, color, delay = 0 }: AgentCardProps) {
    const colors = colorVariants[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                'group relative p-6 rounded-2xl',
                'bg-white dark:bg-zinc-900/80',
                'border border-zinc-200/80 dark:border-zinc-800/80',
                colors.border,
                'shadow-lg shadow-zinc-200/50 dark:shadow-none',
                colors.glow,
                'transition-all duration-500 ease-out',
                'hover:-translate-y-1',
                'backdrop-blur-sm'
            )}
        >
            {/* Subtle glow effect */}
            <div className={cn(
                'absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100',
                'bg-gradient-to-br from-transparent via-transparent to-transparent',
                'transition-opacity duration-500',
                'pointer-events-none'
            )} />

            {/* Content */}
            <div className="relative z-10">
                {/* Icon */}
                <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
                    colors.iconBg,
                    'transition-transform duration-300 group-hover:scale-110'
                )}>
                    <div className={colors.iconColor}>
                        {icon}
                    </div>
                </div>

                {/* Agent Identity */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
                    <p className={cn('text-sm font-medium', colors.iconColor)}>{role}</p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>

                {/* Status indicator */}
                <div className="mt-5 flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full animate-pulse', colors.accent)} />
                    <span className="text-xs text-muted-foreground">Active 24/7</span>
                </div>
            </div>
        </motion.div>
    )
}

export function AgentShowcase() {
    const agents = [
        {
            icon: <TrendingUp className="w-6 h-6" />,
            name: 'The Forecaster',
            role: 'Runway Predictions',
            description: 'Predicts your runway across multiple scenarios. Knows exactly when you need to raise and how much, with real-time updates.',
            color: 'emerald' as const,
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            name: 'The Analyst',
            role: 'Expense Intelligence',
            description: 'Categorizes every transaction, spots spending anomalies, and provides actionable insights to optimize your burn rate.',
            color: 'blue' as const,
        },
        {
            icon: <Bell className="w-6 h-6" />,
            name: 'The Watchdog',
            role: 'Alert System',
            description: 'Monitors your finances 24/7. Alerts you before cash runs low, when burn spikes, or when you hit financial milestones.',
            color: 'amber' as const,
        },
    ]

    return (
        <section className="py-24 px-4 bg-gradient-to-b from-background to-zinc-50/50 dark:to-zinc-950/50">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                        <Sparkles className="h-4 w-4" />
                        Powered by AI Agents
                    </div>
                    <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-4">
                        Meet Your AI Financial Team
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Three specialized AI agents working around the clock to give you
                        financial clarity and confidence.
                    </p>
                </motion.div>

                {/* Agent Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {agents.map((agent, index) => (
                        <AgentCard
                            key={agent.name}
                            {...agent}
                            delay={0.1 + index * 0.15}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
