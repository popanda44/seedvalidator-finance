'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/metric-card'
import { ExpenseBreakdownChart } from '@/components/charts/expense-breakdown-chart'
import { CategoryBarChart } from '@/components/charts/category-bar-chart'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    ChevronDown,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Loader2,
    RefreshCw,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ExpensesPage() {
    const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

    const { data, error, isLoading, mutate } = useSWR('/api/expenses', fetcher, {
        refreshInterval: 60000,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading expense data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Failed to load data</p>
                    <Button onClick={() => mutate()} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    const categories = data?.categories || []
    const summary = data?.summary || {}
    const topVendors = data?.topVendors || []
    const pieChartData = data?.pieChartData || []
    const barChartData = data?.barChartData || []

    const totalExpenses = summary.totalExpenses || 0
    const expenseChange = summary.expenseChange || 0

    // Find biggest increase/decrease
    const sortedByChange = [...categories].sort((a: any, b: any) => b.change - a.change)
    const biggestIncrease = sortedByChange[0] || { name: '-', change: 0 }
    const biggestDecrease = sortedByChange[sortedByChange.length - 1] || { name: '-', change: 0 }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Expenses
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Analyze your spending patterns and trends
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>December 2024</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Expenses"
                    value={totalExpenses}
                    change={expenseChange}
                    icon={DollarSign}
                    iconColor="text-red-500"
                    type="currency"
                    changeLabel="vs last month"
                />
                <MetricCard
                    title="# of Transactions"
                    value={summary.transactionCount || 0}
                    change={12}
                    icon={TrendingUp}
                    iconColor="text-blue-500"
                    type="number"
                    changeLabel="vs last month"
                />
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/50 dark:border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Biggest Increase</span>
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{biggestIncrease.name}</p>
                        <p className="text-sm text-red-500">+{biggestIncrease.change?.toFixed(1)}% vs last month</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/50 dark:border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Biggest Decrease</span>
                            <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{biggestDecrease.name}</p>
                        <p className="text-sm text-emerald-500">{biggestDecrease.change?.toFixed(1)}% vs last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpenseBreakdownChart data={pieChartData} title="Expense Distribution" />
                <CategoryBarChart data={barChartData} title="Category Comparison" showComparison />
            </div>

            {/* Categories Detail */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Categories</CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-500">
                        Manage Categories
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {categories.map((category: any, index: number) => {
                            const isExpanded = expandedCategory === index
                            const change = category.change || 0
                            const isNegativeChange = change < 0

                            return (
                                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setExpandedCategory(isExpanded ? null : index)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: `${category.color}20` }}
                                            >
                                                {category.icon || '📊'}
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {category.name}
                                                    </p>
                                                    {category.alert && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {category.alert}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {category.subcategories?.length || 0} subcategories
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {formatCurrency(category.amount)}
                                                </p>
                                                <p className={cn(
                                                    "text-sm flex items-center gap-1 justify-end",
                                                    isNegativeChange ? "text-emerald-500" : "text-red-500"
                                                )}>
                                                    {isNegativeChange ? (
                                                        <TrendingDown className="w-3 h-3" />
                                                    ) : (
                                                        <TrendingUp className="w-3 h-3" />
                                                    )}
                                                    {isNegativeChange ? '' : '+'}{change.toFixed(1)}%
                                                </p>
                                            </div>
                                            {/* Progress bar showing % of total */}
                                            <div className="w-24 hidden md:block">
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${category.percentage || 0}%`,
                                                            backgroundColor: category.color,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                                    {(category.percentage || 0).toFixed(0)}%
                                                </p>
                                            </div>
                                            <ChevronDown className={cn(
                                                "w-5 h-5 text-muted-foreground transition-transform",
                                                isExpanded && "rotate-180"
                                            )} />
                                        </div>
                                    </button>

                                    {/* Expanded subcategories */}
                                    {isExpanded && category.subcategories && (
                                        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {category.subcategories.map((sub: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                                    >
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">{sub.name}</span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {formatCurrency(sub.amount)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Top Vendors</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">This Month</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {topVendors.map((vendor: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-slate-900 dark:text-white">{vendor.name}</p>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-muted-foreground">
                                            {vendor.category}
                                        </td>
                                        <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">
                                            {formatCurrency(vendor.amount)}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-sm",
                                                vendor.trend > 0 ? "text-red-500" : vendor.trend < 0 ? "text-emerald-500" : "text-slate-400"
                                            )}>
                                                {vendor.trend > 0 ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : vendor.trend < 0 ? (
                                                    <TrendingDown className="w-3 h-3" />
                                                ) : null}
                                                {vendor.trend > 0 ? '+' : ''}{vendor.trend}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
