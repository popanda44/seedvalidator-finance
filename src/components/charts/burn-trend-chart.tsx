'use client'

import { useMemo } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface BurnTrendData {
    month: string
    grossBurn: number
    netBurn: number
    revenue?: number
}

interface BurnTrendChartProps {
    data: BurnTrendData[]
    className?: string
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload || !payload.length) return null

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-xl">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 text-sm capitalize">
                        {entry.name?.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                        {formatCurrency(entry.value as number)}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function BurnTrendChart({ data, className }: BurnTrendChartProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Burn Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="grossBurnGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="netBurnGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis
                                dataKey="month"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="grossBurn"
                                stroke="#f97316"
                                strokeWidth={2}
                                fill="url(#grossBurnGradient)"
                                name="Gross Burn"
                            />
                            <Area
                                type="monotone"
                                dataKey="netBurn"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#netBurnGradient)"
                                name="Net Burn"
                            />
                            {data[0]?.revenue !== undefined && (
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                    name="Revenue"
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm text-muted-foreground">Gross Burn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">Net Burn</span>
                    </div>
                    {data[0]?.revenue !== undefined && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm text-muted-foreground">Revenue</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Sample data generator for demo
export function generateSampleBurnData(): BurnTrendData[] {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => ({
        month,
        grossBurn: 65000 + Math.random() * 20000 + index * 2000,
        netBurn: 50000 + Math.random() * 15000 + index * 1500,
        revenue: 15000 + Math.random() * 10000 + index * 3000,
    }))
}
