'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BurnTrendChart } from '@/components/charts/burn-trend-chart'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PlaidLinkDemoButton } from '@/components/plaid/plaid-link-button'
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download,
    ChevronDown,
    Calendar,
    Building2,
    Wallet,
    TrendingUp,
    RefreshCw,
    Loader2,
    AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const categories = ['All', 'Revenue', 'Payroll', 'Infrastructure', 'SaaS', 'Marketing', 'Office']

export default function CashFlowPage() {
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch data from API
    const { data, error, isLoading, mutate } = useSWR('/api/transactions', fetcher, {
        refreshInterval: 60000,
    })

    const { data: dashboardData } = useSWR('/api/dashboard', fetcher)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading cash flow data...</p>
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

    const transactions = data?.transactions || []
    const accounts = data?.accounts || dashboardData?.accounts || []
    const summary = data?.summary || {}
    const burnTrend = dashboardData?.burnTrend || []

    // Filter transactions
    const filteredTransactions = transactions.filter((t: any) => {
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const totalInflow = summary.totalInflow || 0
    const totalOutflow = summary.totalOutflow || 0
    const netCashFlow = summary.netCashFlow || 0
    const totalCash = accounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Cash Flow
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Track your money in and out
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => mutate()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Accounts
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Inflow"
                    value={totalInflow}
                    icon={ArrowUpRight}
                    iconColor="text-emerald-500"
                    type="currency"
                    changeLabel="this month"
                />
                <MetricCard
                    title="Total Outflow"
                    value={totalOutflow}
                    icon={ArrowDownRight}
                    iconColor="text-red-500"
                    type="currency"
                    changeLabel="this month"
                />
                <MetricCard
                    title="Net Cash Flow"
                    value={netCashFlow}
                    icon={TrendingUp}
                    iconColor={netCashFlow >= 0 ? "text-emerald-500" : "text-red-500"}
                    type="currency"
                    trend={netCashFlow >= 0 ? 'up' : 'down'}
                />
                <MetricCard
                    title="Total Cash"
                    value={totalCash}
                    icon={Wallet}
                    iconColor="text-blue-500"
                    type="currency"
                    changeLabel="across all accounts"
                />
            </div>

            {/* Connected Accounts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">Connected Accounts</CardTitle>
                            <PlaidLinkDemoButton
                                onSuccess={() => mutate()}
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-600"
                            >
                                + Add
                            </PlaidLinkDemoButton>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {accounts.length === 0 ? (
                                <div className="text-center py-8">
                                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground mb-4">No accounts connected</p>
                                    <PlaidLinkDemoButton
                                        onSuccess={() => mutate()}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Connect Bank
                                    </PlaidLinkDemoButton>
                                </div>
                            ) : (
                                accounts.map((account: any) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {account.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {account.type} • Synced just now
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(account.balance)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <BurnTrendChart data={burnTrend.length > 0 ? burnTrend : undefined} />
                </div>
            </div>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="relative">
                                <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>Last 30 days</span>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="flex items-center gap-1 px-1 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                {categories.slice(0, 5).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "px-3 py-1.5 text-sm rounded-md transition-all",
                                            selectedCategory === cat
                                                ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white"
                                                : "text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button className="px-2 py-1.5 text-muted-foreground hover:text-slate-900 dark:hover:text-white">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">No transactions found</p>
                            <PlaidLinkDemoButton
                                onSuccess={() => mutate()}
                                variant="outline"
                            >
                                Connect Bank to Import Transactions
                            </PlaidLinkDemoButton>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredTransactions.map((transaction: any) => (
                                        <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                                        transaction.amount > 0
                                                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                                                            : "bg-slate-100 dark:bg-slate-800"
                                                    )}>
                                                        {transaction.amount > 0 ? (
                                                            <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                        ) : (
                                                            <ArrowDownRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {transaction.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {transaction.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${transaction.categoryColor}20`,
                                                        color: transaction.categoryColor,
                                                    }}
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ backgroundColor: transaction.categoryColor }}
                                                    />
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-muted-foreground">
                                                {transaction.account}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-muted-foreground">
                                                {formatDate(new Date(transaction.date), { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span className={cn(
                                                    "text-sm font-semibold",
                                                    transaction.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : ""
                                                )}>
                                                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredTransactions.length > 0 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredTransactions.length} of {transactions.length} transactions
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm">
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
