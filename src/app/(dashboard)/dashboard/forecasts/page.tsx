'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RevenueForecastChart, generateSampleForecastData } from '@/components/charts/revenue-forecast-chart'
import {
    TrendingUp,
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
} from 'lucide-react'
import { formatCurrency, formatPercentage, cn } from '@/lib/utils'

// Sample metrics
const forecastMetrics = {
    projectedMRR: 175000,
    currentMRR: 125000,
    growthRate: 12.5,
    projectedARR: 2100000,
    confidenceScore: 85,
}

// Sample scenarios
const scenarios = [
    {
        id: 'base',
        name: 'Base Case',
        description: 'Current growth rate continues',
        endMRR: 175000,
        growthRate: 12,
        probability: 70,
        color: '#3B82F6',
    },
    {
        id: 'optimistic',
        name: 'Optimistic',
        description: 'Accelerated growth with new features',
        endMRR: 220000,
        growthRate: 18,
        probability: 15,
        color: '#10B981',
    },
    {
        id: 'pessimistic',
        name: 'Conservative',
        description: 'Market slowdown scenario',
        endMRR: 145000,
        growthRate: 6,
        probability: 15,
        color: '#F59E0B',
    },
]

// Growth drivers
const growthDrivers = [
    { name: 'New customer acquisition', impact: '+$25,000/mo', trend: 'up', confidence: 'High' },
    { name: 'Expansion revenue', impact: '+$12,000/mo', trend: 'up', confidence: 'Medium' },
    { name: 'Reduced churn', impact: '+$8,000/mo', trend: 'up', confidence: 'High' },
    { name: 'New product line', impact: '+$15,000/mo', trend: 'up', confidence: 'Low' },
]

// Assumptions
const assumptions = [
    { label: 'Monthly Growth Rate', value: '12%', editable: true },
    { label: 'Churn Rate', value: '3%', editable: true },
    { label: 'Average Contract Value', value: '$2,500', editable: true },
    { label: 'Sales Cycle (days)', value: '45', editable: true },
    { label: 'Lead Conversion Rate', value: '8%', editable: true },
]

export default function ForecastsPage() {
    const [selectedScenario, setSelectedScenario] = useState('base')
    const [showScenarios, setShowScenarios] = useState(true)
    const forecastData = generateSampleForecastData(12)

    const activeScenario = scenarios.find(s => s.id === selectedScenario)!

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Revenue Forecasts
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Project your revenue growth and plan for the future
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Next 12 months</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    <Button variant="outline" size="sm">
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
                    value={forecastMetrics.currentMRR}
                    change={12}
                    icon={DollarSign}
                    iconColor="text-blue-500"
                    type="currency"
                    changeLabel="MoM"
                />
                <MetricCard
                    title="Projected MRR (EOY)"
                    value={forecastMetrics.projectedMRR}
                    icon={Target}
                    iconColor="text-purple-500"
                    type="currency"
                    changeLabel={`+${formatCurrency(forecastMetrics.projectedMRR - forecastMetrics.currentMRR)}`}
                />
                <MetricCard
                    title="Projected ARR"
                    value={forecastMetrics.projectedARR}
                    icon={BarChart3}
                    iconColor="text-emerald-500"
                    type="currency"
                />
                <MetricCard
                    title="Growth Rate"
                    value={`${forecastMetrics.growthRate}%`}
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
                                {forecastMetrics.confidenceScore}%
                            </span>
                            <span className="text-sm text-emerald-500 mb-1">High</span>
                        </div>
                        <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${forecastMetrics.confidenceScore}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scenario Selector */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Scenario Planning
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show all scenarios</span>
                        <button
                            onClick={() => setShowScenarios(!showScenarios)}
                            className={cn(
                                "relative w-11 h-6 rounded-full transition-colors",
                                showScenarios ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                            )}
                        >
                            <span className={cn(
                                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                                showScenarios ? "translate-x-5" : "translate-x-0.5"
                            )} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {scenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => setSelectedScenario(scenario.id)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all text-left",
                                    selectedScenario === scenario.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                )}
                            >
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
                                <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(scenario.endMRR)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Projected MRR</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-lg font-semibold",
                                            scenario.growthRate >= 12 ? "text-emerald-500" : "text-orange-500"
                                        )}>
                                            +{scenario.growthRate}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">Monthly</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Chart */}
                    <RevenueForecastChart
                        data={forecastData}
                        title="Revenue Projection"
                        showScenarios={showScenarios}
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
                        {growthDrivers.map((driver, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        driver.trend === 'up' ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"
                                    )}>
                                        <TrendingUp className={cn(
                                            "w-5 h-5",
                                            driver.trend === 'up' ? "text-emerald-600" : "text-red-600"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{driver.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Confidence: <span className={cn(
                                                driver.confidence === 'High' ? "text-emerald-500" :
                                                    driver.confidence === 'Medium' ? "text-yellow-500" : "text-red-500"
                                            )}>{driver.confidence}</span>
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
                        {assumptions.map((assumption, idx) => (
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
                            <Button variant="gradient" className="w-full">
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
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Growth Opportunity</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Based on current trends, increasing customer success investment could boost MRR by 15% within 3 months.
                            </p>
                            <Button variant="ghost" size="sm" className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto">
                                Learn more <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                        <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Churn Risk</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                5 enterprise accounts showing reduced engagement. Proactive outreach recommended to prevent $45K ARR at risk.
                            </p>
                            <Button variant="ghost" size="sm" className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto">
                                View accounts <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                        <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Forecast Accuracy</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your forecasts have been 92% accurate over the last 6 months. Current projections are within expected variance.
                            </p>
                            <Button variant="ghost" size="sm" className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto">
                                View history <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
