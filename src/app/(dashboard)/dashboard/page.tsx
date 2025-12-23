'use client'

import {
    CashBalanceCard,
    BurnRateCard,
    RunwayCard,
    MRRCard,
    TeamSizeCard,
    NetBurnCard
} from '@/components/dashboard/metric-card'
import { BurnTrendChart, generateSampleBurnData } from '@/components/charts/burn-trend-chart'
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    CreditCard,
    RefreshCw,
    Download,
    Plus,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    Zap,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

// Sample data for demo
const sampleMetrics = {
    cashBalance: 842500,
    cashChange: 12000,
    burnRate: 68000,
    burnRateChange: -3000,
    runway: 12.4,
    runwayChange: 0.5,
    mrr: 125000,
    mrrChange: 15000,
    teamSize: 24,
    teamSizeChange: 2,
    netBurn: 57000,
    netBurnChange: -5000,
}

const recentTransactions = [
    { id: 1, name: 'AWS', amount: -12450, category: 'Infrastructure', date: new Date() },
    { id: 2, name: 'Stripe Deposit', amount: 28700, category: 'Revenue', date: new Date(Date.now() - 86400000) },
    { id: 3, name: 'Gusto Payroll', amount: -45200, category: 'Payroll', date: new Date(Date.now() - 2 * 86400000) },
    { id: 4, name: 'Google Workspace', amount: -890, category: 'SaaS', date: new Date(Date.now() - 3 * 86400000) },
    { id: 5, name: 'Slack', amount: -750, category: 'SaaS', date: new Date(Date.now() - 4 * 86400000) },
]

const alerts = [
    { id: 1, type: 'warning', title: 'Runway below 12 months', message: 'Consider extending runway', time: '2h ago' },
    { id: 2, type: 'info', title: 'AWS spending up 25%', message: 'Review infrastructure costs', time: '1d ago' },
    { id: 3, type: 'success', title: 'MRR grew 12%', message: 'Strong month-over-month growth', time: '2d ago' },
]

export default function DashboardPage() {
    const burnTrendData = generateSampleBurnData()

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Hero Header with Gradient Background */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-6 md:p-8">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs text-emerald-400 font-medium">Live Data</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                Financial Command Center
                            </h1>
                            <p className="text-slate-300 text-sm">
                                Last synced: {formatDate(new Date())} at {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Transaction
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics inside Hero */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-300 mb-1">Cash Balance</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(sampleMetrics.cashBalance)}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400">+{formatCurrency(sampleMetrics.cashChange)}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-300 mb-1">Burn Rate</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(sampleMetrics.burnRate)}/mo</p>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400">{formatCurrency(sampleMetrics.burnRateChange)}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-300 mb-1">Runway</p>
                            <p className="text-xl font-bold text-white">{sampleMetrics.runway} months</p>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400">+{sampleMetrics.runwayChange} mo</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-300 mb-1">MRR</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(sampleMetrics.mrr)}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400">+{formatCurrency(sampleMetrics.mrrChange)}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-300 mb-1">Team Size</p>
                            <p className="text-xl font-bold text-white">{sampleMetrics.teamSize}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowUpRight className="w-3 h-3 text-blue-400" />
                                <span className="text-xs text-blue-400">+{sampleMetrics.teamSizeChange}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-slate-300 mb-1">Net Burn</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(sampleMetrics.netBurn)}/mo</p>
                            <div className="flex items-center gap-1 mt-1">
                                <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                                <span className="text-xs text-emerald-400">{formatCurrency(sampleMetrics.netBurnChange)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Charts & Transactions */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Burn Trend Chart */}
                    <BurnTrendChart data={burnTrendData} />

                    {/* Recent Transactions */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Recent Transactions
                            </CardTitle>
                            <Button variant="ghost" size="sm">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.amount > 0
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                : 'bg-slate-100 dark:bg-slate-800'
                                                }`}>
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
                                                <p className="text-xs text-muted-foreground">{transaction.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''
                                                }`}>
                                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(transaction.date, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - AI Insights & Alerts */}
                <div className="space-y-6">
                    {/* AI Insights Panel */}
                    <AIInsightsPanel />

                    {/* Alerts */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                Alerts
                            </CardTitle>
                            <Button variant="ghost" size="sm">View All</Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                                >
                                    <div className={`mt-0.5 ${alert.type === 'warning' ? 'text-orange-500' :
                                        alert.type === 'success' ? 'text-emerald-500' :
                                            'text-blue-500'
                                        }`}>
                                        {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                            alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {alert.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 gap-3">
                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-500/50 border-0">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Connect Bank</p>
                                    <p className="text-xs text-muted-foreground">Link accounts via Plaid</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-purple-500/50 border-0">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Add Credit Card</p>
                                    <p className="text-xs text-muted-foreground">Track all spending</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-emerald-500/50 border-0">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Export Report</p>
                                    <p className="text-xs text-muted-foreground">Investor-ready PDF</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

