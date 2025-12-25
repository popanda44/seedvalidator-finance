'use client'

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
    ReferenceLine,
    ComposedChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'

export interface ForecastDataPoint {
    month: string
    actual?: number
    projected: number
    optimistic?: number
    pessimistic?: number
    upperBound?: number
    lowerBound?: number
}

interface RevenueForecastChartProps {
    data: ForecastDataPoint[]
    title?: string
    showScenarios?: boolean
    showConfidenceBand?: boolean
    confidenceLevel?: number // 0.90, 0.95, 0.99
    className?: string
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload || !payload.length) return null

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
            <p className="text-slate-400 text-sm mb-2">{label}</p>
            {payload.map((entry, index) => {
                // Skip rendering the range (it's shown as area)
                if (entry.name === 'Confidence Range') return null
                return (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-300 text-sm capitalize">
                            {entry.name}:
                        </span>
                        <span className="text-white font-medium">
                            {formatCurrency(entry.value as number)}
                        </span>
                    </div>
                )
            })}
            {/* Show confidence bounds if available */}
            {payload[0]?.payload?.upperBound && payload[0]?.payload?.lowerBound && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
                    <div className="flex justify-between">
                        <span>Upper bound:</span>
                        <span className="text-slate-300">{formatCurrency(payload[0].payload.upperBound)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Lower bound:</span>
                        <span className="text-slate-300">{formatCurrency(payload[0].payload.lowerBound)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export function RevenueForecastChart({
    data,
    title = 'Revenue Forecast',
    showScenarios = false,
    showConfidenceBand = true,
    confidenceLevel = 0.95,
    className,
}: RevenueForecastChartProps) {
    // Find the dividing point between actual and projected
    const lastActualIndex = data.findIndex(d => d.actual === undefined) - 1

    // Confidence level label
    const confidenceLabel = `${Math.round(confidenceLevel * 100)}% CI`

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm text-muted-foreground">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">Projected</span>
                    </div>
                    {showConfidenceBand && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500/30" />
                            <span className="text-sm text-muted-foreground">{confidenceLabel}</span>
                        </div>
                    )}
                    {showScenarios && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-sm text-muted-foreground">Optimistic</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span className="text-sm text-muted-foreground">Pessimistic</span>
                            </div>
                        </>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {showScenarios || showConfidenceBand ? (
                            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                                    </linearGradient>
                                    <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                                {lastActualIndex >= 0 && (
                                    <ReferenceLine
                                        x={data[lastActualIndex]?.month}
                                        stroke="#6B7280"
                                        strokeDasharray="5 5"
                                        label={{ value: 'Today', position: 'top', fill: '#9ca3af', fontSize: 11 }}
                                    />
                                )}

                                {/* Confidence Band - shaded area between upper and lower bounds */}
                                {showConfidenceBand && (
                                    <>
                                        <Area
                                            type="monotone"
                                            dataKey="upperBound"
                                            stroke="none"
                                            fill="url(#confidenceGradient)"
                                            fillOpacity={1}
                                            name="Confidence Range"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="lowerBound"
                                            stroke="none"
                                            fill="#ffffff"
                                            fillOpacity={1}
                                            className="dark:fill-slate-900"
                                            name=""
                                        />
                                    </>
                                )}

                                {showScenarios && (
                                    <>
                                        <Area
                                            type="monotone"
                                            dataKey="optimistic"
                                            stroke="#8B5CF6"
                                            strokeWidth={1}
                                            strokeDasharray="5 5"
                                            fill="url(#optimisticGradient)"
                                            name="Optimistic"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="pessimistic"
                                            stroke="#F97316"
                                            strokeWidth={1}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Pessimistic"
                                        />
                                    </>
                                )}

                                {/* Main projected line */}
                                <Line
                                    type="monotone"
                                    dataKey="projected"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                                    name="Projected"
                                />

                                {/* Actual line (on top) */}
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                    name="Actual"
                                />
                            </ComposedChart>
                        ) : (
                            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                {lastActualIndex >= 0 && (
                                    <ReferenceLine
                                        x={data[lastActualIndex]?.month}
                                        stroke="#6B7280"
                                        strokeDasharray="5 5"
                                        label={{ value: 'Today', position: 'top', fill: '#9ca3af', fontSize: 11 }}
                                    />
                                )}
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                    name="Actual"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="projected"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    strokeDasharray="8 4"
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                                    name="Projected"
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

// Sample data generator
export function generateSampleForecastData(months: number = 12): ForecastDataPoint[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()

    return Array.from({ length: months }, (_, i) => {
        const monthIndex = (currentMonth - 6 + i + 12) % 12
        const isPast = i < 6
        const baseValue = 100000 + i * 8000 + Math.random() * 10000

        return {
            month: monthNames[monthIndex],
            actual: isPast ? baseValue : undefined,
            projected: baseValue * (1 + (isPast ? 0 : 0.05)),
            optimistic: isPast ? undefined : baseValue * 1.15,
            pessimistic: isPast ? undefined : baseValue * 0.85,
            upperBound: isPast ? undefined : baseValue * 1.1,
            lowerBound: isPast ? undefined : baseValue * 0.9,
        }
    })
}

