'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RevenueForecastChart } from '@/components/charts/revenue-forecast-chart'
import {
  ScenarioBuilder,
  DeleteScenarioDialog,
  type CustomScenario,
} from '@/components/forecasting/scenario-builder'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  ChevronDown,
  Download,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Zap,
  Loader2,
  AlertTriangle,
  Activity,
  Brain,
  LineChart,
  Plus,
  Trash2,
  Settings2,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Period options for forecast
const PERIOD_OPTIONS = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
  { label: '24 months', value: 24 },
]

// Confidence level options
const CONFIDENCE_LEVELS = [
  { label: '90%', value: 0.9 },
  { label: '95%', value: 0.95 },
  { label: '99%', value: 0.99 },
]

export default function ForecastsPage() {
  const [selectedScenario, setSelectedScenario] = useState('base')
  const [showScenarios, setShowScenarios] = useState(true)
  const [showConfidenceBand, setShowConfidenceBand] = useState(true)
  const [forecastMonths, setForecastMonths] = useState(12)
  const [confidenceLevel, setConfidenceLevel] = useState(0.95)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showConfidenceDropdown, setShowConfidenceDropdown] = useState(false)

  // Custom scenarios state
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([])
  const [showScenarioBuilder, setShowScenarioBuilder] = useState(false)
  const [editingScenario, setEditingScenario] = useState<CustomScenario | null>(null)
  const [deleteScenario, setDeleteScenario] = useState<CustomScenario | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/forecasts?months=${forecastMonths}&confidence=${confidenceLevel}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading forecast data...</p>
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

  const metrics = data?.metrics || {}
  const scenarios = data?.scenarios || []
  const growthDrivers = data?.growthDrivers || []
  const assumptions = data?.assumptions || []
  const projectedData = data?.projectedData || []
  const modelMetrics = data?.modelMetrics || {}

  // Combine preset and custom scenarios
  const allScenarios = [...scenarios, ...customScenarios]
  const activeScenario = allScenarios.find((s: any) => s.id === selectedScenario) || allScenarios[0]

  // Handle save custom scenario
  const handleSaveScenario = (scenario: CustomScenario) => {
    setCustomScenarios((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === scenario.id)
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev]
        updated[existingIndex] = scenario
        return updated
      }
      // Add new
      return [...prev, scenario]
    })
    setEditingScenario(null)
  }

  // Handle delete custom scenario
  const handleDeleteScenario = () => {
    if (deleteScenario) {
      setCustomScenarios((prev) => prev.filter((s) => s.id !== deleteScenario.id))
      if (selectedScenario === deleteScenario.id) {
        setSelectedScenario('base')
      }
      setDeleteScenario(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue Forecasts</h2>
          <p className="text-sm text-muted-foreground">
            Project your revenue growth and plan for the future
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPeriodDropdown(!showPeriodDropdown)
                setShowConfidenceDropdown(false)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Next {forecastMonths} months</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform',
                  showPeriodDropdown && 'rotate-180'
                )}
              />
            </button>
            {showPeriodDropdown && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setForecastMonths(option.value)
                      setShowPeriodDropdown(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                      forecastMonths === option.value &&
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Confidence Level Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowConfidenceDropdown(!showConfidenceDropdown)
                setShowPeriodDropdown(false)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <span>{Math.round(confidenceLevel * 100)}% CI</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform',
                  showConfidenceDropdown && 'rotate-180'
                )}
              />
            </button>
            {showConfidenceDropdown && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1">
                {CONFIDENCE_LEVELS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setConfidenceLevel(option.value)
                      setShowConfidenceDropdown(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors',
                      confidenceLevel === option.value &&
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {option.label} confidence
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
          <Button variant="gradient" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Current MRR"
          value={metrics.currentMRR || 0}
          change={12}
          icon={DollarSign}
          iconColor="text-blue-500"
          type="currency"
          changeLabel="MoM"
        />
        <MetricCard
          title="Projected MRR (EOY)"
          value={metrics.projectedMRR || 0}
          icon={Target}
          iconColor="text-purple-500"
          type="currency"
          changeLabel={`+${formatCurrency((metrics.projectedMRR || 0) - (metrics.currentMRR || 0))}`}
        />
        <MetricCard
          title="Projected ARR"
          value={metrics.projectedARR || 0}
          icon={BarChart3}
          iconColor="text-emerald-500"
          type="currency"
        />
        <MetricCard
          title="Growth Rate"
          value={`${metrics.growthRate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          iconColor="text-orange-500"
          changeLabel="monthly compound"
        />
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.confidenceScore || 0}%
              </span>
              <span className="text-sm text-emerald-500 mb-1">High</span>
            </div>
            <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${metrics.confidenceScore || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Metrics */}
      {modelMetrics?.method && (
        <Card className="border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/10 dark:to-blue-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  AI Forecasting Model
                </span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Holt-Winters Smoothing
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/50">
                <p className="text-xs text-muted-foreground mb-1">Model Accuracy</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {(100 - (modelMetrics.mape || 15)).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  MAPE: {modelMetrics.mape?.toFixed(1) || '15.0'}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/50">
                <p className="text-xs text-muted-foreground mb-1">Trend Direction</p>
                <div className="flex items-center gap-1">
                  {modelMetrics.trendDirection === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  ) : modelMetrics.trendDirection === 'down' ? (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  ) : (
                    <LineChart className="w-5 h-5 text-yellow-500" />
                  )}
                  <span
                    className={cn(
                      'text-lg font-semibold capitalize',
                      modelMetrics.trendDirection === 'up'
                        ? 'text-emerald-600'
                        : modelMetrics.trendDirection === 'down'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    )}
                  >
                    {modelMetrics.trendDirection || 'Stable'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/50">
                <p className="text-xs text-muted-foreground mb-1">Seasonality</p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    modelMetrics.seasonalityDetected ? 'text-blue-600' : 'text-slate-500'
                  )}
                >
                  {modelMetrics.seasonalityDetected ? 'Detected' : 'Not Detected'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Period: {modelMetrics.modelParams?.seasonalPeriod || 12} months
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-800/50">
                <p className="text-xs text-muted-foreground mb-1">Smoothing Params</p>
                <div className="text-xs space-y-0.5">
                  <p>α (level): {modelMetrics.modelParams?.alpha?.toFixed(2) || '0.30'}</p>
                  <p>β (trend): {modelMetrics.modelParams?.beta?.toFixed(2) || '0.10'}</p>
                  <p>γ (season): {modelMetrics.modelParams?.gamma?.toFixed(2) || '0.30'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Selector */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Scenario Planning
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScenarioBuilder(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Scenario
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show all scenarios</span>
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  showScenarios ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    showScenarios ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence band</span>
              <button
                onClick={() => setShowConfidenceBand(!showConfidenceBand)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  showConfidenceBand ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    showConfidenceBand ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {allScenarios.map((scenario: any) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left relative group',
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                {/* Delete button for custom scenarios */}
                {scenario.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteScenario(scenario)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-500" />
                  </button>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {scenario.name}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                    {scenario.probability}% likely
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {scenario.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(scenario.endMRR)}
                    </p>
                    <p className="text-xs text-muted-foreground">Projected MRR</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-lg font-semibold',
                        scenario.growthRate >= 12 ? 'text-emerald-500' : 'text-orange-500'
                      )}
                    >
                      +{scenario.growthRate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chart */}
          <RevenueForecastChart
            data={projectedData}
            title="Revenue Projection"
            showScenarios={showScenarios}
            showConfidenceBand={showConfidenceBand}
            confidenceLevel={confidenceLevel}
          />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Drivers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Growth Drivers</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-500">
              + Add Driver
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {growthDrivers.map((driver: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      driver.trend === 'up'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        'w-5 h-5',
                        driver.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence:{' '}
                      <span
                        className={cn(
                          driver.confidence === 'High'
                            ? 'text-emerald-500'
                            : driver.confidence === 'Medium'
                              ? 'text-yellow-500'
                              : 'text-red-500'
                        )}
                      >
                        {driver.confidence}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {driver.impact}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Forecast Assumptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Forecast Assumptions</CardTitle>
            <Button variant="ghost" size="sm">
              Reset Defaults
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {assumptions.map((assumption: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">{assumption.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={assumption.value}
                    disabled={!assumption.editable}
                    className="w-24 px-3 py-1.5 text-sm text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="gradient" className="w-full" onClick={() => mutate()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Forecast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Growth Opportunity
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on current trends, increasing customer success investment could boost MRR by
                15% within 3 months.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto"
              >
                Learn more <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Churn Risk
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 enterprise accounts showing reduced engagement. Proactive outreach recommended to
                prevent $45K ARR at risk.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto"
              >
                View accounts <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Forecast Accuracy
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your forecasts have been 92% accurate over the last 6 months. Current projections
                are within expected variance.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto"
              >
                View history <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Builder Modal */}
      <ScenarioBuilder
        open={showScenarioBuilder}
        onOpenChange={setShowScenarioBuilder}
        currentMRR={metrics.currentMRR || 125000}
        onSave={handleSaveScenario}
        editingScenario={editingScenario}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteScenarioDialog
        open={!!deleteScenario}
        onOpenChange={(open) => !open && setDeleteScenario(null)}
        scenarioName={deleteScenario?.name || ''}
        onConfirm={handleDeleteScenario}
      />
    </div>
  )
}
