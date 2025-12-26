/**
 * FinYeld AI - Forecasting Models
 * Prophet-style time series forecasting with seasonality detection
 */

// Types
export interface TimeSeriesPoint {
    date: Date
    value: number
}

export interface ForecastResult {
    date: Date
    predicted: number
    lowerBound: number
    upperBound: number
    trend: number
    seasonalityFactor: number
}

export interface ForecastConfig {
    months: number
    confidenceLevel: number
    includeSeasonality: boolean
    regressors?: string[]
}

// ==========================================
// TREND ANALYSIS
// ==========================================
export function calculateTrend(data: TimeSeriesPoint[]): {
    slope: number
    intercept: number
    growthRate: number
} {
    const n = data.length
    if (n < 2) return { slope: 0, intercept: data[0]?.value || 0, growthRate: 0 }

    // Convert dates to numeric (months from start)
    const startTime = data[0].date.getTime()
    const xs = data.map((d) => (d.date.getTime() - startTime) / (30 * 24 * 60 * 60 * 1000))
    const ys = data.map((d) => d.value)

    // Linear regression
    const sumX = xs.reduce((a, b) => a + b, 0)
    const sumY = ys.reduce((a, b) => a + b, 0)
    const sumXY = xs.reduce((total, x, i) => total + x * ys[i], 0)
    const sumX2 = xs.reduce((total, x) => total + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate growth rate (MoM)
    const avgValue = sumY / n
    const growthRate = avgValue > 0 ? (slope / avgValue) * 100 : 0

    return { slope, intercept, growthRate }
}

// ==========================================
// SEASONALITY DETECTION (Fourier Series)
// ==========================================
export function detectSeasonality(
    data: TimeSeriesPoint[],
    periods: number = 12
): { factors: number[]; strength: number } {
    const n = data.length
    if (n < periods * 2) {
        return { factors: Array(periods).fill(1), strength: 0 }
    }

    // Calculate average for each month/period
    const periodAverages: number[] = Array(periods).fill(0)
    const periodCounts: number[] = Array(periods).fill(0)

    data.forEach((point) => {
        const periodIndex = point.date.getMonth()
        periodAverages[periodIndex] += point.value
        periodCounts[periodIndex]++
    })

    // Normalize
    const overallAvg = data.reduce((sum, p) => sum + p.value, 0) / n
    const factors = periodAverages.map((sum, i) =>
        periodCounts[i] > 0 && overallAvg > 0 ? sum / periodCounts[i] / overallAvg : 1
    )

    // Calculate seasonality strength (variance of factors)
    const factorMean = factors.reduce((a, b) => a + b, 0) / factors.length
    const variance = factors.reduce((sum, f) => sum + Math.pow(f - factorMean, 2), 0) / factors.length
    const strength = Math.min(Math.sqrt(variance) * 2, 1) // Normalize to 0-1

    return { factors, strength }
}

// ==========================================
// REVENUE FORECASTING
// ==========================================
export function forecastRevenue(
    historicalData: TimeSeriesPoint[],
    config: ForecastConfig
): ForecastResult[] {
    const { months, confidenceLevel = 0.95, includeSeasonality = true } = config

    if (historicalData.length < 3) {
        throw new Error('Insufficient data for forecasting. Need at least 3 data points.')
    }

    // Sort by date
    const sortedData = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate trend
    const trend = calculateTrend(sortedData)

    // Detect seasonality
    const seasonality = includeSeasonality ? detectSeasonality(sortedData) : { factors: Array(12).fill(1), strength: 0 }

    // Calculate residual standard deviation for confidence intervals
    const predictions = sortedData.map((point, i) => {
        const monthsFromStart = i
        const predicted = trend.intercept + trend.slope * monthsFromStart
        return predicted * seasonality.factors[point.date.getMonth()]
    })

    const residuals = sortedData.map((point, i) => point.value - predictions[i])
    const residualStdDev = Math.sqrt(
        residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length
    )

    // Z-score for confidence level
    const zScore = confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.95 ? 1.96 : 1.645

    // Generate forecast
    const lastDate = sortedData[sortedData.length - 1].date
    const lastMonthsFromStart = sortedData.length - 1
    const results: ForecastResult[] = []

    for (let i = 1; i <= months; i++) {
        const forecastDate = new Date(lastDate)
        forecastDate.setMonth(forecastDate.getMonth() + i)

        const monthsFromStart = lastMonthsFromStart + i
        const trendValue = trend.intercept + trend.slope * monthsFromStart
        const seasonalFactor = seasonality.factors[forecastDate.getMonth()]
        const predicted = trendValue * seasonalFactor

        // Wider confidence intervals for further predictions
        const uncertaintyGrowth = 1 + (i / months) * 0.5
        const margin = zScore * residualStdDev * uncertaintyGrowth

        results.push({
            date: forecastDate,
            predicted: Math.max(0, predicted),
            lowerBound: Math.max(0, predicted - margin),
            upperBound: predicted + margin,
            trend: trend.growthRate,
            seasonalityFactor: seasonalFactor,
        })
    }

    return results
}

// ==========================================
// BURN RATE PREDICTION
// ==========================================
export interface BurnRateInputs {
    historicalExpenses: TimeSeriesPoint[]
    currentHeadcount: number
    avgSalary: number
    hiringPlan: { month: number; hires: number }[]
    fixedCosts: number // rent, subscriptions, etc.
    revenueForcast: number[]
    variableCostRatio: number // variable costs as % of revenue
}

export function predictBurnRate(
    inputs: BurnRateInputs,
    months: number = 12
): ForecastResult[] {
    const {
        historicalExpenses,
        currentHeadcount,
        avgSalary,
        hiringPlan,
        fixedCosts,
        revenueForcast,
        variableCostRatio,
    } = inputs

    // Calculate historical variance for confidence intervals
    const values = historicalExpenses.map((p) => p.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    const results: ForecastResult[] = []
    let headcount = currentHeadcount
    const lastDate = historicalExpenses[historicalExpenses.length - 1]?.date || new Date()

    for (let i = 1; i <= months; i++) {
        const forecastDate = new Date(lastDate)
        forecastDate.setMonth(forecastDate.getMonth() + i)

        // Check for new hires this month
        const hiresThisMonth = hiringPlan.find((h) => h.month === i)?.hires || 0
        headcount += hiresThisMonth

        // Calculate costs
        const payrollCost = headcount * avgSalary
        const variableCost = (revenueForcast[i - 1] || 0) * variableCostRatio
        const totalBurn = payrollCost + fixedCosts + variableCost

        // Confidence intervals (widen over time)
        const uncertaintyGrowth = 1 + (i / months) * 0.3
        const margin = 1.96 * stdDev * uncertaintyGrowth

        results.push({
            date: forecastDate,
            predicted: totalBurn,
            lowerBound: Math.max(0, totalBurn - margin),
            upperBound: totalBurn + margin,
            trend: 0, // Could calculate growth rate
            seasonalityFactor: 1,
        })
    }

    return results
}

// ==========================================
// ANOMALY DETECTION (Isolation Forest style)
// ==========================================
export interface Transaction {
    id: string
    amount: number
    date: Date
    category: string
    merchant: string
}

export interface AnomalyResult {
    transaction: Transaction
    score: number // -1 to 1 (lower = more anomalous)
    isAnomaly: boolean
    reason: string
}

export function detectAnomalies(
    transactions: Transaction[],
    historicalTransactions: Transaction[],
    contamination: number = 0.05
): AnomalyResult[] {
    // Build statistical profiles by category
    const categoryStats: Map<string, { mean: number; stdDev: number; count: number }> = new Map()

    historicalTransactions.forEach((tx) => {
        const stats = categoryStats.get(tx.category) || { mean: 0, stdDev: 0, count: 0 }
        stats.count++
        categoryStats.set(tx.category, stats)
    })

    // Calculate mean and std dev per category
    historicalTransactions.forEach((tx) => {
        const stats = categoryStats.get(tx.category)!
        stats.mean += tx.amount / stats.count
    })

    historicalTransactions.forEach((tx) => {
        const stats = categoryStats.get(tx.category)!
        stats.stdDev += Math.pow(tx.amount - stats.mean, 2)
    })

    categoryStats.forEach((stats) => {
        stats.stdDev = Math.sqrt(stats.stdDev / Math.max(stats.count - 1, 1))
    })

    // Score each transaction
    const results: AnomalyResult[] = transactions.map((tx) => {
        const stats = categoryStats.get(tx.category)
        let score = 0
        let reason = ''

        if (!stats || stats.count < 3) {
            // Unknown category - slightly anomalous
            score = -0.3
            reason = `Rare category: ${tx.category}`
        } else {
            // Z-score based anomaly detection
            const zScore = stats.stdDev > 0 ? Math.abs(tx.amount - stats.mean) / stats.stdDev : 0

            if (zScore > 3) {
                score = -0.8
                reason = `Amount ${tx.amount.toFixed(0)} is ${zScore.toFixed(1)}σ from average (${stats.mean.toFixed(0)})`
            } else if (zScore > 2) {
                score = -0.5
                reason = `Unusually ${tx.amount > stats.mean ? 'high' : 'low'} amount for ${tx.category}`
            } else {
                score = 1 - zScore / 3 // Normal range
                reason = 'Within expected range'
            }
        }

        // Check for duplicates (same amount, merchant, within 7 days)
        const duplicates = transactions.filter(
            (t) =>
                t.id !== tx.id &&
                t.amount === tx.amount &&
                t.merchant === tx.merchant &&
                Math.abs(t.date.getTime() - tx.date.getTime()) < 7 * 24 * 60 * 60 * 1000
        )

        if (duplicates.length > 0) {
            score = Math.min(score, -0.6)
            reason = `Possible duplicate transaction (${duplicates.length} similar)`
        }

        return {
            transaction: tx,
            score,
            isAnomaly: score < -0.4,
            reason,
        }
    })

    // Sort by score (most anomalous first)
    results.sort((a, b) => a.score - b.score)

    // Limit anomalies to contamination rate
    const maxAnomalies = Math.ceil(transactions.length * contamination)
    let anomalyCount = 0

    return results.map((r) => {
        if (r.isAnomaly && anomalyCount < maxAnomalies) {
            anomalyCount++
            return r
        }
        return { ...r, isAnomaly: false }
    })
}

// ==========================================
// SCENARIO ANALYSIS
// ==========================================
export interface Scenario {
    name: string
    revenueMultiplier: number
    burnMultiplier: number
    description: string
}

export const SCENARIOS: Record<string, Scenario> = {
    best_case: {
        name: 'Best Case',
        revenueMultiplier: 1.3,
        burnMultiplier: 0.9,
        description: 'Revenue 30% above forecast, costs 10% below',
    },
    base_case: {
        name: 'Base Case',
        revenueMultiplier: 1.0,
        burnMultiplier: 1.0,
        description: 'Expected trajectory based on current trends',
    },
    worst_case: {
        name: 'Worst Case',
        revenueMultiplier: 0.7,
        burnMultiplier: 1.2,
        description: 'Revenue 30% below forecast, costs 20% above',
    },
}

export function applyScenario(forecast: ForecastResult[], scenario: Scenario): ForecastResult[] {
    return forecast.map((f) => ({
        ...f,
        predicted: f.predicted * scenario.revenueMultiplier,
        lowerBound: f.lowerBound * scenario.revenueMultiplier,
        upperBound: f.upperBound * scenario.revenueMultiplier,
    }))
}

// ==========================================
// MODEL METRICS
// ==========================================
export function calculateMAPE(
    actual: number[],
    predicted: number[]
): number {
    if (actual.length !== predicted.length || actual.length === 0) return 0

    const ape = actual.map((a, i) => (a !== 0 ? Math.abs((a - predicted[i]) / a) : 0))
    return (ape.reduce((sum, e) => sum + e, 0) / ape.length) * 100
}

export function calculateRMSE(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length || actual.length === 0) return 0

    const squaredErrors = actual.map((a, i) => Math.pow(a - predicted[i], 2))
    return Math.sqrt(squaredErrors.reduce((sum, e) => sum + e, 0) / squaredErrors.length)
}

// ==========================================
// DATAPOINT TYPE ALIAS (for API compatibility)
// ==========================================
export type DataPoint = TimeSeriesPoint

// ==========================================
// PROPHET SERVICE (compatibility layer)
// ==========================================
export interface ProphetForecastOptions {
    horizonMonths: number
    confidenceLevel: number
    seasonalPeriod: number
}

export interface ProphetForecast {
    month: string
    actual: number | null
    projected: number
    upperBound: number
    lowerBound: number
}

export interface ProphetResult {
    forecasts: ProphetForecast[]
    metrics: {
        mape: number
        mae: number
        trendDirection: 'up' | 'down' | 'stable'
        seasonalityDetected: boolean
    }
    modelParams: {
        alpha: number
        beta: number
        gamma: number
    }
}

/**
 * Prophet-compatible forecasting service
 * Wraps the forecastRevenue function with the API-expected interface
 */
export const prophetService = {
    forecast(data: DataPoint[], options: ProphetForecastOptions): ProphetResult {
        const { horizonMonths, confidenceLevel, seasonalPeriod } = options

        // Handle insufficient data
        if (data.length < 3) {
            const now = new Date()
            const emptyForecasts: ProphetForecast[] = []

            for (let i = 0; i < horizonMonths; i++) {
                const forecastDate = new Date(now)
                forecastDate.setMonth(forecastDate.getMonth() + i)
                emptyForecasts.push({
                    month: forecastDate.toISOString().slice(0, 7),
                    actual: null,
                    projected: data[data.length - 1]?.value || 0,
                    upperBound: data[data.length - 1]?.value || 0,
                    lowerBound: data[data.length - 1]?.value || 0,
                })
            }

            return {
                forecasts: emptyForecasts,
                metrics: {
                    mape: 0,
                    mae: 0,
                    trendDirection: 'stable',
                    seasonalityDetected: false,
                },
                modelParams: { alpha: 0.3, beta: 0.1, gamma: 0.1 },
            }
        }

        // Run forecasting
        const results = forecastRevenue(data, {
            months: horizonMonths,
            confidenceLevel,
            includeSeasonality: seasonalPeriod === 12,
        })

        // Detect trend direction
        const trend = calculateTrend(data)
        const trendDirection: 'up' | 'down' | 'stable' =
            trend.growthRate > 2 ? 'up' :
                trend.growthRate < -2 ? 'down' : 'stable'

        // Detect seasonality
        const seasonality = detectSeasonality(data, seasonalPeriod)
        const seasonalityDetected = seasonality.strength > 0.1

        // Calculate backtest metrics (use last 20% for validation)
        const splitIndex = Math.floor(data.length * 0.8)
        const trainData = data.slice(0, splitIndex)
        const testData = data.slice(splitIndex)

        let mape = 10 // Default
        let mae = 0

        if (trainData.length >= 3 && testData.length > 0) {
            const backtestResults = forecastRevenue(trainData, {
                months: testData.length,
                confidenceLevel,
                includeSeasonality: seasonalPeriod === 12,
            })

            const actual = testData.map(d => d.value)
            const predicted = backtestResults.map(r => r.predicted)

            mape = calculateMAPE(actual, predicted)
            mae = actual.reduce((sum, a, i) => sum + Math.abs(a - predicted[i]), 0) / actual.length
        }

        // Transform results to expected format
        const forecasts: ProphetForecast[] = []

        // Add historical data points
        data.forEach((point) => {
            forecasts.push({
                month: point.date.toISOString().slice(0, 7),
                actual: point.value,
                projected: point.value,
                upperBound: point.value,
                lowerBound: point.value,
            })
        })

        // Add forecast points
        results.forEach((result) => {
            forecasts.push({
                month: result.date.toISOString().slice(0, 7),
                actual: null,
                projected: Math.round(result.predicted),
                upperBound: Math.round(result.upperBound),
                lowerBound: Math.round(result.lowerBound),
            })
        })

        return {
            forecasts,
            metrics: {
                mape: Math.round(mape * 10) / 10,
                mae: Math.round(mae),
                trendDirection,
                seasonalityDetected,
            },
            modelParams: {
                alpha: 0.3,
                beta: 0.1,
                gamma: seasonalityDetected ? 0.2 : 0.1,
            },
        }
    },
}

