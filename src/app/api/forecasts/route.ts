import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { prophetService, type DataPoint } from '@/lib/forecasting'

// GET /api/forecasts - Get forecast data and scenarios using Prophet-style forecasting
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('companyId')
        const months = parseInt(searchParams.get('months') || '12')
        const confidence = parseFloat(searchParams.get('confidence') || '0.95')

        // Validate confidence level
        const validConfidence = [0.90, 0.95, 0.99].includes(confidence) ? confidence : 0.95

        // For development, return sample data if no companyId
        if (!companyId) {
            return NextResponse.json(getSampleForecastData(months, validConfidence))
        }

        // Get company data with more historical snapshots for better forecasting
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                forecasts: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                snapshots: {
                    orderBy: { date: 'desc' },
                    take: 24, // Get up to 2 years of data for seasonality detection
                },
            },
        })

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // Convert snapshots to DataPoints for Prophet service
        const snapshotData = company.snapshots
        const historicalData: DataPoint[] = snapshotData
            .filter(s => s.mrr !== null)
            .map(s => ({
                date: new Date(s.date),
                value: s.mrr ? Number(s.mrr.toString()) : 0
            }))
            .reverse() // Chronological order

        // Use Prophet service for forecasting
        const forecastResult = prophetService.forecast(historicalData, {
            horizonMonths: months,
            confidenceLevel: 0.95,
            seasonalPeriod: 12
        })

        // Get current metrics
        const currentMRR = historicalData.length > 0
            ? historicalData[historicalData.length - 1].value
            : 0
        const previousMRR = historicalData.length > 1
            ? historicalData[historicalData.length - 2].value
            : currentMRR
        const growthRate = previousMRR > 0
            ? ((currentMRR - previousMRR) / previousMRR) * 100
            : 0

        // Get final projected value
        const finalForecast = forecastResult.forecasts[forecastResult.forecasts.length - 1]

        // Transform forecast data to expected format
        const projectedData = forecastResult.forecasts.map(f => ({
            month: f.month,
            actual: f.actual,
            projected: f.projected,
            optimistic: f.upperBound,
            pessimistic: f.lowerBound,
        }))

        return NextResponse.json({
            metrics: {
                currentMRR,
                projectedMRR: finalForecast?.projected || currentMRR,
                projectedARR: (finalForecast?.projected || currentMRR) * 12,
                growthRate,
                confidenceScore: Math.round(100 - forecastResult.metrics.mape),
            },
            projectedData,
            scenarios: generateScenarios(currentMRR, growthRate),
            growthDrivers: getGrowthDrivers(),
            assumptions: getAssumptions(growthRate),
            // New Prophet-specific metrics
            modelMetrics: {
                mape: forecastResult.metrics.mape,
                mae: forecastResult.metrics.mae,
                trendDirection: forecastResult.metrics.trendDirection,
                seasonalityDetected: forecastResult.metrics.seasonalityDetected,
                modelParams: forecastResult.modelParams,
                method: 'HOLT_WINTERS'
            }
        })
    } catch (error) {
        console.error('Forecasts API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch forecasts' },
            { status: 500 }
        )
    }
}

function generateScenarios(currentMRR: number, growthRate: number) {
    return [
        {
            id: 'base',
            name: 'Base Case',
            description: 'Current growth rate continues',
            endMRR: currentMRR * Math.pow(1 + (growthRate / 100), 12),
            growthRate: growthRate,
            probability: 70,
            color: '#3B82F6',
        },
        {
            id: 'optimistic',
            name: 'Optimistic',
            description: 'Accelerated growth with new features',
            endMRR: currentMRR * Math.pow(1 + (growthRate * 1.5 / 100), 12),
            growthRate: growthRate * 1.5,
            probability: 15,
            color: '#10B981',
        },
        {
            id: 'pessimistic',
            name: 'Conservative',
            description: 'Market slowdown scenario',
            endMRR: currentMRR * Math.pow(1 + (growthRate * 0.5 / 100), 12),
            growthRate: growthRate * 0.5,
            probability: 15,
            color: '#F59E0B',
        },
    ]
}

function getGrowthDrivers() {
    return [
        { name: 'New customer acquisition', impact: '+$25,000/mo', trend: 'up', confidence: 'High' },
        { name: 'Expansion revenue', impact: '+$12,000/mo', trend: 'up', confidence: 'Medium' },
        { name: 'Reduced churn', impact: '+$8,000/mo', trend: 'up', confidence: 'High' },
        { name: 'New product line', impact: '+$15,000/mo', trend: 'up', confidence: 'Low' },
    ]
}

function getAssumptions(growthRate: number) {
    return [
        { label: 'Monthly Growth Rate', value: `${growthRate.toFixed(1)}%`, editable: true },
        { label: 'Churn Rate', value: '3%', editable: true },
        { label: 'Average Contract Value', value: '$2,500', editable: true },
        { label: 'Sales Cycle (days)', value: '45', editable: true },
        { label: 'Lead Conversion Rate', value: '8%', editable: true },
    ]
}

// Sample data for development using Prophet service
function getSampleForecastData(months: number, confidence: number = 0.95) {
    const currentMRR = 125000
    const growthRate = 12.5

    // Generate sample historical data (6 months)
    const historicalData: DataPoint[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        // Add some realistic variation
        const seasonalFactor = 1 + 0.1 * Math.sin(i * Math.PI / 6) // Slight seasonality
        const randomNoise = 1 + (Math.random() - 0.5) * 0.05 // ±2.5% noise
        const value = currentMRR * Math.pow(1 - growthRate / 100 / 12, i) * seasonalFactor * randomNoise
        historicalData.push({ date, value })
    }

    // Use Prophet service for sample data
    const forecastResult = prophetService.forecast(historicalData, {
        horizonMonths: months,
        confidenceLevel: confidence,
        seasonalPeriod: 12
    })

    // Transform forecast data to expected format
    const projectedData = forecastResult.forecasts.map(f => ({
        month: f.month,
        actual: f.actual,
        projected: f.projected,
        optimistic: f.upperBound,
        pessimistic: f.lowerBound,
    }))

    const finalForecast = forecastResult.forecasts[forecastResult.forecasts.length - 1]

    return {
        metrics: {
            currentMRR,
            projectedMRR: finalForecast?.projected || 175000,
            projectedARR: (finalForecast?.projected || 175000) * 12,
            growthRate,
            confidenceScore: Math.round(100 - forecastResult.metrics.mape),
        },
        projectedData,
        scenarios: [
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
        ],
        growthDrivers: getGrowthDrivers(),
        assumptions: getAssumptions(growthRate),
        // New Prophet-specific metrics
        modelMetrics: {
            mape: forecastResult.metrics.mape,
            mae: forecastResult.metrics.mae,
            trendDirection: forecastResult.metrics.trendDirection,
            seasonalityDetected: forecastResult.metrics.seasonalityDetected,
            modelParams: forecastResult.modelParams,
            method: 'HOLT_WINTERS'
        }
    }
}
