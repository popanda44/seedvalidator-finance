'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BurnTrendChart, generateSampleBurnData } from '@/components/charts/burn-trend-chart'
import { MetricCard } from '@/components/dashboard/metric-card'
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
} from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

// Sample transaction data
const sampleTransactions = [
    { id: 1, name: 'AWS Cloud Services', description: 'Monthly infrastructure', amount: -12450, category: 'Infrastructure', categoryColor: '#10B981', date: new Date(), account: 'Chase Business', status: 'completed' },
    { id: 2, name: 'Stripe Payment', description: 'Customer payment received', amount: 28700, category: 'Revenue', categoryColor: '#3B82F6', date: new Date(Date.now() - 86400000), account: 'Chase Business', status: 'completed' },
    { id: 3, name: 'Gusto Payroll', description: 'Bi-weekly payroll', amount: -45200, category: 'Payroll', categoryColor: '#F59E0B', date: new Date(Date.now() - 2 * 86400000), account: 'Chase Business', status: 'completed' },
    { id: 4, name: 'Google Workspace', description: 'Monthly subscription', amount: -890, category: 'SaaS', categoryColor: '#8B5CF6', date: new Date(Date.now() - 3 * 86400000), account: 'Mercury', status: 'completed' },
    { id: 5, name: 'Slack', description: 'Team communication', amount: -750, category: 'SaaS', categoryColor: '#8B5CF6', date: new Date(Date.now() - 4 * 86400000), account: 'Mercury', status: 'completed' },
    { id: 6, name: 'Customer Invoice #1234', description: 'Enterprise client', amount: 15000, category: 'Revenue', categoryColor: '#3B82F6', date: new Date(Date.now() - 5 * 86400000), account: 'Chase Business', status: 'completed' },
    { id: 7, name: 'GitHub Enterprise', description: 'Annual subscription', amount: -3200, category: 'SaaS', categoryColor: '#8B5CF6', date: new Date(Date.now() - 6 * 86400000), account: 'Mercury', status: 'completed' },
    { id: 8, name: 'WeWork Office', description: 'Monthly office rent', amount: -4500, category: 'Office', categoryColor: '#EC4899', date: new Date(Date.now() - 7 * 86400000), account: 'Chase Business', status: 'completed' },
    { id: 9, name: 'Facebook Ads', description: 'Marketing campaign', amount: -2800, category: 'Marketing', categoryColor: '#F97316', date: new Date(Date.now() - 8 * 86400000), account: 'Mercury', status: 'pending' },
    { id: 10, name: 'Consulting Services', description: 'Customer consulting', amount: 8500, category: 'Revenue', categoryColor: '#3B82F6', date: new Date(Date.now() - 9 * 86400000), account: 'Chase Business', status: 'completed' },
]

const accounts = [
    { id: 1, name: 'Chase Business Checking', balance: 542000, type: 'checking', lastSync: new Date() },
    { id: 2, name: 'Mercury', balance: 300500, type: 'checking', lastSync: new Date() },
]

const categories = ['All', 'Revenue', 'Payroll', 'Infrastructure', 'SaaS', 'Marketing', 'Office']

export default function CashFlowPage() {
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [dateRange, setDateRange] = useState('30d')
    const burnTrendData = generateSampleBurnData()

    // Filter transactions
    const filteredTransactions = sampleTransactions.filter(t => {
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Calculate totals
    const totalInflow = sampleTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const totalOutflow = Math.abs(sampleTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
    const netCashFlow = totalInflow - totalOutflow

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
                    <Button variant="outline" size="sm">
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
                    value={accounts.reduce((sum, a) => sum + a.balance, 0)}
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
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                                + Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {accounts.map((account) => (
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
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <BurnTrendChart data={burnTrendData} />
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
                                {filteredTransactions.map((transaction) => (
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
                                            {formatDate(transaction.date, { month: 'short', day: 'numeric' })}
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredTransactions.length} of {sampleTransactions.length} transactions
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
                </CardContent>
            </Card>
        </div>
    )
}
