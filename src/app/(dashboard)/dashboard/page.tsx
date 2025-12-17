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
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Financial Overview
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Last synced: {formatDate(new Date())} at {new Date().toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="gradient" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <CashBalanceCard value={sampleMetrics.cashBalance} change={sampleMetrics.cashChange} />
                <BurnRateCard value={sampleMetrics.burnRate} change={sampleMetrics.burnRateChange} />
                <RunwayCard value={sampleMetrics.runway} change={sampleMetrics.runwayChange} />
                <MRRCard value={sampleMetrics.mrr} change={sampleMetrics.mrrChange} />
                <TeamSizeCard value={sampleMetrics.teamSize} change={sampleMetrics.teamSizeChange} />
                <NetBurnCard value={sampleMetrics.netBurn} change={sampleMetrics.netBurnChange} />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Burn Trend Chart */}
                <div className="lg:col-span-2">
                    <BurnTrendChart data={burnTrendData} />
                </div>

                {/* Alerts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
                        <Button variant="ghost" size="sm">View All</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-500/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Connect Bank</p>
                            <p className="text-sm text-muted-foreground">Link your accounts</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-purple-500/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Add Credit Card</p>
                            <p className="text-sm text-muted-foreground">Track spending</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-emerald-500/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Export Report</p>
                            <p className="text-sm text-muted-foreground">Download PDF</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
