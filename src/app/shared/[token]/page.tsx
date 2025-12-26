'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  AlertTriangle,
  Loader2,
  PieChart,
  BarChart3,
} from 'lucide-react'

interface SharedReportData {
  title: string
  companyName: string
  period: string
  generatedAt: string
  metrics: {
    cashBalance: number
    burnRate: number
    runway: number
    mrr: number
    mrrChange: number
    arr: number
  }
  expenses: { category: string; amount: number; percentage: number }[]
  cashFlow: { month: string; inflow: number; outflow: number }[]
  summary: string
}

interface SharedReportMeta {
  createdAt: string
  expiresAt: string
  views: number
}

export default function SharedReportPage() {
  const params = useParams()
  const token = params.token as string

  const [report, setReport] = useState<SharedReportData | null>(null)
  const [meta, setMeta] = useState<SharedReportMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/share?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load report')
          return
        }

        setReport(data.report)
        setMeta(data.meta)
      } catch (err) {
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Report Unavailable
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const daysUntilExpiry = meta
    ? Math.ceil((new Date(meta.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SV</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              SeedValidator Finance
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{meta?.views || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Expires in {daysUntilExpiry} days</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <Building2 className="w-5 h-5" />
            <span>{report.companyName}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{report.period}</span>
            </div>
            <span>•</span>
            <span>Generated {new Date(report.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Cash Balance"
            value={formatCurrency(report.metrics.cashBalance)}
            icon={DollarSign}
            color="blue"
          />
          <MetricCard
            label="Monthly Burn"
            value={formatCurrency(report.metrics.burnRate)}
            icon={TrendingDown}
            color="red"
          />
          <MetricCard
            label="Runway"
            value={`${report.metrics.runway.toFixed(1)} months`}
            icon={Clock}
            color="amber"
          />
          <MetricCard
            label="MRR"
            value={formatCurrency(report.metrics.mrr)}
            change={report.metrics.mrrChange}
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Summary</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{report.summary}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Expense Breakdown
              </h2>
            </div>
            <div className="space-y-3">
              {report.expenses.map((expense, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: [
                          '#3B82F6',
                          '#8B5CF6',
                          '#10B981',
                          '#F59E0B',
                          '#EF4444',
                          '#6B7280',
                        ][idx % 6],
                      }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">{expense.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-sm text-slate-500">({expense.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cash Flow</h2>
            </div>
            <div className="space-y-3">
              {report.cashFlow.map((cf, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 w-10">{cf.month}</span>
                  <div className="flex-1 px-4">
                    <div className="flex gap-1 h-4">
                      <div
                        className="bg-emerald-500 rounded-sm"
                        style={{ width: `${(cf.inflow / 150000) * 100}%` }}
                      />
                      <div
                        className="bg-red-500 rounded-sm"
                        style={{ width: `${(cf.outflow / 150000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <span className={cf.inflow >= cf.outflow ? 'text-emerald-500' : 'text-red-500'}>
                      {cf.inflow >= cf.outflow ? '+' : ''}
                      {formatCurrency(cf.inflow - cf.outflow)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p>This report was shared via SeedValidator Finance</p>
          <p className="mt-1">
            <a href="https://seedvalidator.finance" className="text-blue-500 hover:underline">
              Learn more about AI-powered financial insights
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  change?: number
  icon: React.ElementType
  color: 'blue' | 'red' | 'amber' | 'emerald'
}) {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {change !== undefined && (
        <p className={`text-sm ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}
          {change}% MoM
        </p>
      )}
    </div>
  )
}
