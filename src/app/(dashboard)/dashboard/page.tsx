'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

// Existing components
import { BurnTrendChart } from '@/components/charts/burn-trend-chart'
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'
import { PlaidLinkDemoButton } from '@/components/plaid/plaid-link-button'
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
  TrendingUp,
  Zap,
  Loader2,
  DollarSign,
  Users,
  Flame,
  Target,
  Brain,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Clean metric card component
function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  subtitle,
}: {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: any
  subtitle?: string
}) {
  return (
    <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' :
                    trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple status indicator
function StatusDot({ status }: { status: 'healthy' | 'warning' | 'critical' }) {
  const colors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch dashboard data from API
  const { data, error, isLoading, mutate } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await mutate()
    setIsRefreshing(false)
  }

  const handleBankConnected = () => {
    mutate()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm mb-4">Please try again later</p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const metrics = data?.metrics || {}
  const recentTransactions = data?.recentTransactions || []
  const alerts = data?.alerts || []
  const burnTrend = data?.burnTrend || []

  // Calculate runway status
  const runwayStatus = metrics.runway > 12 ? 'healthy' : metrics.runway > 6 ? 'warning' : 'critical'

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusDot status={runwayStatus} />
            <span className="text-xs text-muted-foreground font-medium">
              {runwayStatus === 'healthy' ? 'All systems healthy' : runwayStatus === 'warning' ? 'Needs attention' : 'Critical alert'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-sm text-muted-foreground">
            Last synced: {formatDate(new Date())} at {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ========== METRICS GRID ========== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Cash Balance"
          value={formatCurrency(metrics.cashBalance || 0)}
          change={5.2}
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Burn Rate"
          value={`${formatCurrency(metrics.monthlyBurn || 0)}/mo`}
          change={metrics.burnChange || 0}
          trend={metrics.burnChange < 0 ? 'up' : 'down'}
          icon={Flame}
        />
        <MetricCard
          title="Runway"
          value={`${metrics.runway?.toFixed(1) || 0} mo`}
          trend={runwayStatus === 'healthy' ? 'up' : runwayStatus === 'warning' ? 'neutral' : 'down'}
          icon={Target}
          subtitle={runwayStatus === 'healthy' ? 'Healthy' : runwayStatus === 'warning' ? 'Monitor' : 'Low'}
        />
        <MetricCard
          title="MRR"
          value={formatCurrency(metrics.mrr || 0)}
          change={metrics.mrrChange || 0}
          trend={metrics.mrrChange > 0 ? 'up' : 'neutral'}
          icon={TrendingUp}
        />
        <MetricCard
          title="Team Size"
          value={metrics.teamSize || 0}
          icon={Users}
          subtitle="Members"
        />
        <MetricCard
          title="Net Burn"
          value={`${formatCurrency(metrics.netBurn || 0)}/mo`}
          trend={metrics.netBurn < 0 ? 'up' : 'down'}
          icon={Zap}
          subtitle={metrics.netBurn < 0 ? 'Profitable' : 'Burning'}
        />
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts & Transactions */}
        <div className="xl:col-span-2 space-y-6">
          {/* Burn Trend Chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Financial Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BurnTrendChart data={burnTrend.length > 0 ? burnTrend : undefined} />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No transactions yet</p>
                  <PlaidLinkDemoButton onSuccess={handleBankConnected} variant="outline" size="sm">
                    Connect Bank to Import
                  </PlaidLinkDemoButton>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentTransactions.slice(0, 6).map((transaction: any) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${transaction.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'
                          }`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{transaction.name}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                          }`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(transaction.date), { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Insights & Actions */}
        <div className="space-y-6">
          {/* AI Insights Panel */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsightsPanel />
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All clear! No alerts</p>
                </div>
              ) : (
                alerts.slice(0, 3).map((alert: any) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`mt-0.5 ${alert.type === 'critical' ? 'text-red-500' :
                        alert.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                      {alert.type === 'critical' || alert.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <PlaidLinkDemoButton
              onSuccess={handleBankConnected}
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">Connect Bank</p>
                  <p className="text-xs text-muted-foreground">Link accounts via Plaid</p>
                </div>
              </div>
            </PlaidLinkDemoButton>

            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">Add Card</p>
                  <p className="text-xs text-muted-foreground">Track all spending</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">Export Report</p>
                  <p className="text-xs text-muted-foreground">Investor-ready PDF</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
