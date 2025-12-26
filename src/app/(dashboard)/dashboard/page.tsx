'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

// Premium glassmorphism components
import { LiquidGlassCard, AuroraCard, MetricGlassCard, HolographicCard } from '@/components/ui/glass-cards'

// Advanced visualization components
import { AnimatedGauge, ParticleTrend, PulseRing, GlowLineChart, DataStream, SmartTooltip } from '@/components/ui/advanced-visualizations'

// AI visualization components  
import { AIThinking, ConfidenceMeter, InsightCard, PredictiveTrend } from '@/components/ai/ai-visualizations'

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
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)

  // Fetch dashboard data from API
  const { data, error, isLoading, mutate } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setAiAnalyzing(true)
    await mutate()
    setTimeout(() => setAiAnalyzing(false), 2000)
    setIsRefreshing(false)
  }

  const handleBankConnected = () => {
    mutate()
  }

  // Loading state with premium animation
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <PulseRing status="loading" size={64} />
          </div>
          <p className="text-muted-foreground">Initializing FinYeld AI...</p>
          <AIThinking isThinking={true} className="justify-center mt-4" />
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <PulseRing status="critical" size={64} className="mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Connection Error</p>
          <p className="text-muted-foreground text-sm mb-4">Failed to sync financial data</p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </motion.div>
      </div>
    )
  }

  const metrics = data?.metrics || {}
  const recentTransactions = data?.recentTransactions || []
  const alerts = data?.alerts || []
  const burnTrend = data?.burnTrend || []

  // Calculate runway status
  const runwayStatus = metrics.runway > 12 ? 'healthy' : metrics.runway > 6 ? 'warning' : 'critical'

  // Sample data for visualizations
  const trendData = [45, 52, 49, 63, 58, 72, 68, 75, 82, 78, 85, 92]
  const predictedData = [95, 102, 108, 115]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========== HERO HEADER ========== */}
      <AuroraCard className="p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <PulseRing status={runwayStatus} size={32} />
                <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                  System {runwayStatus === 'healthy' ? 'Optimal' : runwayStatus === 'warning' ? 'Alert' : 'Critical'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                FinYeld AI Command Center
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <AIThinking isThinking={aiAnalyzing} />
                {!aiAnalyzing && `Last synced: ${formatDate(new Date())} at ${new Date().toLocaleTimeString()}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </AuroraCard>

      {/* ========== METRICS GRID WITH GLASSMORPHISM ========== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricGlassCard
          title="Cash Balance"
          value={formatCurrency(metrics.cashBalance || 0)}
          change={5.2}
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricGlassCard
          title="Burn Rate"
          value={`${formatCurrency(metrics.monthlyBurn || 0)}/mo`}
          change={metrics.burnChange || 0}
          trend={metrics.burnChange < 0 ? 'up' : 'down'}
          icon={<Flame className="w-5 h-5" />}
        />
        <SmartTooltip content={`${metrics.runway?.toFixed(1) || 0} months until cash depletion`}>
          <LiquidGlassCard className="p-4 cursor-help">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Runway</p>
                <div className="flex items-center gap-2">
                  <AnimatedGauge
                    value={Math.min((metrics.runway || 0) / 24 * 100, 100)}
                    label="months"
                    sublabel={`${metrics.runway?.toFixed(1) || 0}`}
                    size={80}
                    color={runwayStatus === 'healthy' ? '#22c55e' : runwayStatus === 'warning' ? '#f59e0b' : '#ef4444'}
                  />
                </div>
              </div>
              <ParticleTrend trend={runwayStatus === 'healthy' ? 'up' : runwayStatus === 'warning' ? 'stable' : 'down'} intensity={4} />
            </div>
          </LiquidGlassCard>
        </SmartTooltip>
        <MetricGlassCard
          title="MRR"
          value={formatCurrency(metrics.mrr || 0)}
          change={metrics.mrrChange || 0}
          trend={metrics.mrrChange > 0 ? 'up' : 'neutral'}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricGlassCard
          title="Team Size"
          value={metrics.teamSize || 0}
          trend="neutral"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricGlassCard
          title="Net Burn"
          value={`${formatCurrency(metrics.netBurn || 0)}/mo`}
          trend={metrics.netBurn < 0 ? 'up' : 'down'}
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      {/* ========== MAIN CONTENT GRID ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts & Transactions */}
        <div className="xl:col-span-2 space-y-6">
          {/* Burn Trend with Glow Effect */}
          <HolographicCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Financial Trajectory
                </h3>
                <p className="text-xs text-slate-400 mt-1">AI-powered predictive analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Confidence:</span>
                <ConfidenceMeter confidence={87} className="w-24" />
              </div>
            </div>

            {/* Mini sparkline charts */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-2">Revenue Trend</p>
                <GlowLineChart data={trendData} width={120} height={40} color="#22c55e" />
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-2">Expense Trend</p>
                <GlowLineChart data={[65, 59, 80, 81, 56, 55, 70, 72, 68, 60, 55, 50]} width={120} height={40} color="#ef4444" />
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-2">Predicted Growth</p>
                <PredictiveTrend historicalData={trendData.slice(-6)} predictedData={predictedData} />
              </div>
            </div>

            {/* Main burn trend chart */}
            <BurnTrendChart data={burnTrend.length > 0 ? burnTrend : undefined} />
          </HolographicCard>

          {/* Recent Transactions */}
          <LiquidGlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Recent Transactions
              </h3>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                View All
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <DataStream data={[20, 40, 30, 50, 45, 60, 55]} height={40} className="mb-4 opacity-30" />
                <p className="text-slate-400 mb-4">No transactions yet</p>
                <PlaidLinkDemoButton onSuccess={handleBankConnected} variant="outline" size="sm">
                  Connect Bank to Import
                </PlaidLinkDemoButton>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.slice(0, 5).map((transaction: any) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${transaction.amount > 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                          }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{transaction.name}</p>
                        <p className="text-xs text-slate-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(new Date(transaction.date), { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </LiquidGlassCard>
        </div>

        {/* Right Column - AI Insights & Actions */}
        <div className="space-y-6">
          {/* AI Insights Panel */}
          <LiquidGlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Insights
              </h3>
              <AIThinking isThinking={aiAnalyzing} />
            </div>

            <div className="space-y-4">
              <InsightCard
                type="prediction"
                title="Revenue Growth Detected"
                description="Based on current trends, your MRR is projected to increase by 15% over the next quarter."
                confidence={87}
                action="View Forecast"
              />
              <InsightCard
                type="warning"
                title="Expense Spike Alert"
                description="Software subscriptions increased 23% this month. Consider reviewing unused services."
                confidence={92}
                action="Review Expenses"
              />
              <InsightCard
                type="opportunity"
                title="Runway Extension"
                description="Reducing marketing spend by 10% could extend runway by 2.3 months without impact on growth."
                confidence={78}
                action="Simulate"
              />
            </div>
          </LiquidGlassCard>

          {/* System Status */}
          <LiquidGlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              System Status
            </h3>

            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-4">
                  <PulseRing status="healthy" size={48} className="mx-auto mb-3" />
                  <p className="text-sm text-slate-400">All systems operational</p>
                </div>
              ) : (
                alerts.slice(0, 3).map((alert: any) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <PulseRing
                      status={alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'warning' : 'healthy'}
                      size={24}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <p className="text-xs text-slate-400">{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </LiquidGlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <PlaidLinkDemoButton
              onSuccess={handleBankConnected}
              variant="outline"
              className="w-full justify-start p-4 h-auto bg-white/5 border-white/10 hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white text-sm">Connect Bank</p>
                  <p className="text-xs text-slate-400">Link accounts via Plaid</p>
                </div>
              </div>
            </PlaidLinkDemoButton>

            <LiquidGlassCard className="group cursor-pointer hover:border-purple-500/50 transition-colors">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Add Card</p>
                  <p className="text-xs text-slate-400">Track all spending</p>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="group cursor-pointer hover:border-emerald-500/50 transition-colors">
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Export Report</p>
                  <p className="text-xs text-slate-400">Investor-ready PDF</p>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
