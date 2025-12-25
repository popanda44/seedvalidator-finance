'use client'

import { cn, formatCurrency, formatPercentage, formatRunway, getRunwayStatus } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import {
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
    Flame,
    Timer,
    BarChart3,
    Users,
    Wallet,
    type LucideIcon
} from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: LucideIcon
    iconColor?: string
    type?: 'currency' | 'runway' | 'percentage' | 'number'
    trend?: 'up' | 'down' | 'neutral'
    size?: 'default' | 'lg'
    className?: string
}

export function MetricCard({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
    iconColor = "text-blue-500",
    type = 'currency',
    trend,
    size = 'default',
    className,
}: MetricCardProps) {
    // Format value based on type
    const formattedValue = (() => {
        if (typeof value === 'string') return value
        switch (type) {
            case 'currency':
                return formatCurrency(value)
            case 'runway':
                return formatRunway(value)
            case 'percentage':
                return formatPercentage(value)
            case 'number':
                return value.toLocaleString()
            default:
                return value.toString()
        }
    })()

    // Determine trend if not provided
    const effectiveTrend = trend ?? (change && change > 0 ? 'up' : change && change < 0 ? 'down' : 'neutral')

    // Get trend icon and color
    const TrendIcon = effectiveTrend === 'up' ? TrendingUp : effectiveTrend === 'down' ? TrendingDown : Minus
    const trendColor = (() => {
        if (type === 'runway') {
            // For runway, up is good
            return effectiveTrend === 'up' ? 'text-emerald-500' : effectiveTrend === 'down' ? 'text-red-500' : 'text-gray-400'
        }
        // For most metrics like burn rate, down is good
        if (title.toLowerCase().includes('burn')) {
            return effectiveTrend === 'down' ? 'text-emerald-500' : effectiveTrend === 'up' ? 'text-red-500' : 'text-gray-400'
        }
        // Default: up is good
        return effectiveTrend === 'up' ? 'text-emerald-500' : effectiveTrend === 'down' ? 'text-red-500' : 'text-gray-400'
    })()

    // Runway status for runway type
    const runwayStatus = type === 'runway' && typeof value === 'number' ? getRunwayStatus(value) : null

    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-slate-100/10",
            "bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800",
            "border-slate-200/50 dark:border-slate-700/50",
            className
        )}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                {Icon && <Icon className="w-full h-full" />}
            </div>

            <CardContent className={cn(
                "relative",
                size === 'lg' ? 'p-8' : 'p-6'
            )}>
                {/* Header with icon */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    {Icon && (
                        <div className={cn(
                            "p-2 rounded-lg",
                            "bg-slate-100 dark:bg-slate-800",
                            iconColor
                        )}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Main value */}
                <div className="flex items-end gap-3">
                    <span className={cn(
                        "font-bold tracking-tight text-slate-900 dark:text-white",
                        size === 'lg' ? 'text-4xl' : 'text-3xl',
                        runwayStatus && runwayStatus.color
                    )}>
                        {formattedValue}
                    </span>

                    {/* Runway status badge */}
                    {runwayStatus && (
                        <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full mb-1",
                            runwayStatus.status === 'critical' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            runwayStatus.status === 'warning' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                            runwayStatus.status === 'caution' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                            runwayStatus.status === 'healthy' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        )}>
                            {runwayStatus.label}
                        </span>
                    )}
                </div>

                {/* Change indicator */}
                {(change !== undefined || changeLabel) && (
                    <div className="flex items-center gap-1 mt-3">
                        <TrendIcon className={cn("w-4 h-4", trendColor)} />
                        {change !== undefined && (
                            <span className={cn("text-sm font-medium", trendColor)}>
                                {change > 0 ? '+' : ''}{type === 'currency' ? formatCurrency(change) : formatPercentage(change)}
                            </span>
                        )}
                        {changeLabel && (
                            <span className="text-sm text-muted-foreground ml-1">
                                {changeLabel}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Pre-configured metric cards for common use cases
export function CashBalanceCard({ value, change }: { value: number; change?: number }) {
    return (
        <MetricCard
            title="Cash Balance"
            value={value}
            change={change}
            changeLabel="vs last month"
            icon={DollarSign}
            iconColor="text-emerald-500"
            type="currency"
        />
    )
}

export function BurnRateCard({ value, change }: { value: number; change?: number }) {
    return (
        <MetricCard
            title="Monthly Burn"
            value={value}
            change={change}
            changeLabel="vs last month"
            icon={Flame}
            iconColor="text-orange-500"
            type="currency"
        />
    )
}

export function RunwayCard({ value, change }: { value: number; change?: number }) {
    return (
        <MetricCard
            title="Runway"
            value={value}
            change={change}
            changeLabel="vs last month"
            icon={Timer}
            iconColor="text-blue-500"
            type="runway"
        />
    )
}

export function MRRCard({ value, change }: { value: number; change?: number }) {
    return (
        <MetricCard
            title="MRR"
            value={value}
            change={change}
            changeLabel="MoM growth"
            icon={BarChart3}
            iconColor="text-purple-500"
            type="currency"
        />
    )
}

export function TeamSizeCard({ value, change }: { value: number; change?: number }) {
    return (
        <MetricCard
            title="Team Size"
            value={value}
            change={change}
            changeLabel="this month"
            icon={Users}
            iconColor="text-cyan-500"
            type="number"
        />
    )
}

export function NetBurnCard({ value, change }: { value: number; change?: number }) {
    return (
        <MetricCard
            title="Net Burn"
            value={value}
            change={change}
            changeLabel="vs last month"
            icon={Wallet}
            iconColor="text-rose-500"
            type="currency"
        />
    )
}
