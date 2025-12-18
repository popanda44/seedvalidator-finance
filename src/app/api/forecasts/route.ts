import { NextResponse } from 'next/server'

// GET /api/forecasts - Get revenue forecasts and scenarios
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const months = parseInt(searchParams.get('months') || '12')

        // Return sample data (database queries will be added when DB is connected)
        return NextResponse.json(getSampleForecastData(months))
    } catch (error) {
        console.error('Forecasts API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch forecast data' },
            { status: 500 }
        )
    }
}

// POST /api/forecasts - Update forecast assumptions
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { companyId, assumptions } = body

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID required' },
                { status: 400 }
            )
        }

        // Store forecast assumptions (could be stored in company settings or separate model)
        // For now, we'll just recalculate based on provided assumptions
        const { growthRate, churnRate, avgContractValue } = assumptions

        // Generate updated forecast based on assumptions
        const baseGrowth = growthRate / 100 || 0.1
        const adjustedGrowth = baseGrowth * (1 - (churnRate / 100 || 0.03))

        return NextResponse.json({
            success: true,
            updatedGrowthRate: adjustedGrowth * 100,
            message: 'Forecast updated with new assumptions',
        })
    } catch (error) {
        console.error('Update forecast error:', error)
        return NextResponse.json(
            { error: 'Failed to update forecast' },
            { status: 500 }
        )
    }
}

function calculateConfidenceScore(snapshots: any[]): number {
    // Simple confidence calculation based on data quality
    let score = 50 // Base score

    // More data = higher confidence
    score += Math.min(snapshots.length * 5, 25)

    // Consistent growth = higher confidence
    if (snapshots.length >= 3) {
        const growthVariance = calculateGrowthVariance(snapshots)
        if (growthVariance < 0.1) score += 15
        else if (growthVariance < 0.2) score += 10
        else if (growthVariance < 0.3) score += 5
    }

    return Math.min(score, 95)
}

function calculateGrowthVariance(snapshots: any[]): number {
    const growthRates = []
    for (let i = 1; i < snapshots.length; i++) {
        const prev = snapshots[i - 1].mrr || 0
        const curr = snapshots[i].mrr || 0
        if (prev > 0) {
            growthRates.push((curr - prev) / prev)
        }
    }

    if (growthRates.length === 0) return 1

    const avg = growthRates.reduce((a, b) => a + b, 0) / growthRates.length
    const variance = growthRates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / growthRates.length
    return Math.sqrt(variance)
}

// Sample data generator
function getSampleForecastData(months: number) {
    const currentMrr = 125000
    const growthRate = 12

    // Define type for projections
    type Projection = {
        month: string
        actual?: number
        projected?: number
        optimistic?: number
        pessimistic?: number
    }

    const projections: Projection[] = [
        { month: 'Jul', actual: 80000 },
        { month: 'Aug', actual: 90000 },
        { month: 'Sep', actual: 100000 },
        { month: 'Oct', actual: 110000 },
        { month: 'Nov', actual: 118000 },
        { month: 'Dec', actual: 125000 },
    ]

    // Generate future months
    let currentValue = currentMrr
    const futureMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startMonth = 0 // January

    for (let i = 0; i < Math.min(months, 12); i++) {
        currentValue = currentValue * (1 + growthRate / 100)
        projections.push({
            month: futureMonths[(startMonth + i) % 12],
            projected: Math.round(currentValue),
            optimistic: Math.round(currentValue * 1.2),
            pessimistic: Math.round(currentValue * 0.85),
        })
    }

    const lastProjection = projections[projections.length - 1]
    const projectedMrr = lastProjection?.projected || currentMrr

    return {
        currentMrr,
        projectedMrr,
        projectedArr: projectedMrr * 12,
        growthRate,
        confidenceScore: 85,
        projections,
        scenarios: [
            {
                id: 'base',
                name: 'Base Case',
                description: 'Current growth rate continues',
                endMrr: projectedMrr,
                growthRate: 12,
                probability: 70,
            },
            {
                id: 'optimistic',
                name: 'Optimistic',
                description: 'Accelerated growth with new features',
                endMrr: Math.round(projectedMrr * 1.25),
                growthRate: 18,
                probability: 15,
            },
            {
                id: 'pessimistic',
                name: 'Conservative',
                description: 'Market slowdown scenario',
                endMrr: Math.round(projectedMrr * 0.75),
                growthRate: 6,
                probability: 15,
            },
        ],
        growthDrivers: [
            { name: 'New customer acquisition', impact: '+$25,000/mo', trend: 'up', confidence: 'High' },
            { name: 'Expansion revenue', impact: '+$12,000/mo', trend: 'up', confidence: 'Medium' },
            { name: 'Reduced churn', impact: '+$8,000/mo', trend: 'up', confidence: 'High' },
            { name: 'New product line', impact: '+$15,000/mo', trend: 'up', confidence: 'Low' },
        ],
    }
}
