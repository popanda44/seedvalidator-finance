'use client'

import { motion } from 'framer-motion'
import { Check, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonRow {
    feature: string
    spreadsheets: string | boolean
    others: string | boolean
    finyeld: string | boolean
}

const comparisonData: ComparisonRow[] = [
    {
        feature: 'Setup Time',
        spreadsheets: 'Days',
        others: 'Hours',
        finyeld: '5 Minutes',
    },
    {
        feature: 'AI Forecasting',
        spreadsheets: false,
        others: 'Limited',
        finyeld: 'Full AI',
    },
    {
        feature: 'Bank Connection',
        spreadsheets: 'Manual',
        others: 'Some',
        finyeld: 'Real-time',
    },
    {
        feature: 'Scenario Planning',
        spreadsheets: 'Complex',
        others: 'Basic',
        finyeld: 'One-click',
    },
    {
        feature: 'Automated Reports',
        spreadsheets: false,
        others: 'Weekly',
        finyeld: 'Daily + On-demand',
    },
]

function CellValue({ value, highlight = false }: { value: string | boolean; highlight?: boolean }) {
    if (typeof value === 'boolean') {
        return value ? (
            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
        ) : (
            <X className="w-5 h-5 text-zinc-400 mx-auto" />
        )
    }

    return (
        <span className={cn(
            'font-medium',
            highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
        )}>
            {value}
            {highlight && <Check className="inline-block w-4 h-4 ml-1 text-emerald-500" />}
        </span>
    )
}

export function ComparisonTable() {
    return (
        <section className="py-24 px-4 bg-background">
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                        <Sparkles className="h-4 w-4" />
                        Why Choose Us
                    </div>
                    <h2 className="serif-heading text-3xl md:text-4xl text-foreground mb-4">
                        The Smarter Way to Manage Finances
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        See how FinYeld AI compares to traditional methods and other tools.
                    </p>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                        'rounded-2xl overflow-hidden',
                        'bg-white dark:bg-zinc-900',
                        'border border-zinc-200 dark:border-zinc-800',
                        'shadow-xl shadow-zinc-200/50 dark:shadow-none'
                    )}
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="p-4 font-medium text-foreground">Feature</div>
                        <div className="p-4 font-medium text-center text-muted-foreground">Spreadsheets</div>
                        <div className="p-4 font-medium text-center text-muted-foreground">Other Tools</div>
                        <div className="p-4 font-semibold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10">
                            FinYeld AI
                        </div>
                    </div>

                    {/* Table Rows */}
                    {comparisonData.map((row, index) => (
                        <motion.div
                            key={row.feature}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                'grid grid-cols-4',
                                'border-b border-zinc-100 dark:border-zinc-800 last:border-b-0',
                                'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors'
                            )}
                        >
                            <div className="p-4 font-medium text-foreground">{row.feature}</div>
                            <div className="p-4 text-center">
                                <CellValue value={row.spreadsheets} />
                            </div>
                            <div className="p-4 text-center">
                                <CellValue value={row.others} />
                            </div>
                            <div className="p-4 text-center bg-emerald-50/30 dark:bg-emerald-500/5">
                                <CellValue value={row.finyeld} highlight />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA below table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-10"
                >
                    <p className="text-muted-foreground mb-4">
                        Ready to upgrade from spreadsheets?
                    </p>
                    <a
                        href="/register"
                        className={cn(
                            'inline-flex items-center gap-2 px-6 py-3 rounded-full',
                            'bg-foreground text-background',
                            'hover:opacity-90 transition-opacity',
                            'font-medium shadow-lg'
                        )}
                    >
                        Start Free Trial
                        <Sparkles className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
