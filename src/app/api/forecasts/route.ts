import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/forecasts - Get forecast data and scenarios
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('companyId')
        const months = parseInt(searchParams.get('months') || '12')

        // For development, return sample data if no companyId
        if (!companyId) {
            return NextResponse.json(getSampleForecastData(months))
        }

        // Get company data
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                forecasts: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                financialSnapshots: {
                    orderBy: { date: 'desc' },
                    take: 6,
                },
            },
        })

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // Calculate metrics from snapshots
        const snapshots = company.financialSnapshots
        const currentMRR = snapshots[0]?.mrr || 0
        const previousMRR = snapshots[1]?.mrr || currentMRR
        const growthRate = previousMRR > 0
            ? ((currentMRR - previousMRR) / previousMRR) * 100
            : 0

        // Project future MRR based on growth rate
        const projectedData = generateProjection(currentMRR, growthRate / 100, months)

        return NextResponse.json({
            metrics: {
                currentMRR,
                projectedMRR: projectedData[projectedData.length - 1]?.projected || currentMRR,
                projectedARR: (projectedData[projectedData.length - 1]?.projected || currentMRR) * 12,
                growthRate,
                confidenceScore: calculateConfidenceScore(snapshots),
            },
            projectedData,
            scenarios: generateScenarios(currentMRR, growthRate),
            growthDrivers: getGrowthDrivers(),
            assumptions: getAssumptions(growthRate),
        })
    } catch (error) {
        console.error('Forecasts API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch forecasts' },
            { status: 500 }
        )
    }
}

function generateProjection(currentMRR: number, monthlyGrowthRate: number, months: number) {
    const data = []
    let mrr = currentMRR

    for (let i = 0; i <= months; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() + i)

        data.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            actual: i === 0 ? mrr : null,
            projected: mrr,
            optimistic: mrr * (1 + (monthlyGrowthRate * 1.5)),
            pessimistic: mrr * (1 + (monthlyGrowthRate * 0.5)),
        })

        mrr *= (1 + monthlyGrowthRate)
    }

    return data
}

function calculateConfidenceScore(snapshots: any[]): number {
    // Simple confidence based on data availability
    if (snapshots.length >= 6) return 85
    if (snapshots.length >= 3) return 70
    return 50
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

// Sample data for development
function getSampleForecastData(months: number) {
    const currentMRR = 125000
    const growthRate = 12.5

    return {
        metrics: {
            currentMRR,
            projectedMRR: 175000,
            projectedARR: 2100000,
            growthRate,
            confidenceScore: 85,
        },
        projectedData: generateProjection(currentMRR, growthRate / 100, months),
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
    }
}
