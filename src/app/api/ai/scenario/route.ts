import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
    generateScenarioAnalysis,
    generateBenchmarkInsights,
    analyzeHiringDecision,
    type FinancialData,
} from '@/lib/openai'
import prisma from '@/lib/prisma'

// POST /api/ai/scenario - Analyze financial scenarios
export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { type, variables, hiringData, benchmarkData } = body

        // Get user's financial context
        const context = await getFinancialContext(session.user.id)

        // Check if OpenAI is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                success: true,
                isDemo: true,
                analysis: getDemoAnalysis(type),
            })
        }

        let result

        switch (type) {
            case 'scenario':
                if (!variables) {
                    return NextResponse.json(
                        { error: 'Variables required for scenario analysis' },
                        { status: 400 }
                    )
                }
                result = await generateScenarioAnalysis(
                    variables.scenarioType || 'Custom Scenario',
                    variables,
                    context
                )
                break

            case 'benchmark':
                result = await generateBenchmarkInsights(
                    context,
                    benchmarkData?.industry || 'SaaS',
                    benchmarkData?.stage || 'Series A'
                )
                break

            case 'hiring':
                if (!hiringData?.roleName || !hiringData?.salary) {
                    return NextResponse.json(
                        { error: 'Role name and salary required for hiring analysis' },
                        { status: 400 }
                    )
                }
                result = await analyzeHiringDecision(
                    hiringData.roleName,
                    hiringData.salary,
                    context
                )
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid analysis type. Use: scenario, benchmark, or hiring' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            type,
            analysis: result,
            context: {
                runway: context.runway,
                burnRate: context.burnRate,
                cash: context.cashBalance,
            },
            generatedAt: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error('Scenario analysis error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze scenario' },
            { status: 500 }
        )
    }
}

// GET /api/ai/scenario - Get demo scenarios
export async function GET() {
    return NextResponse.json({
        success: true,
        availableAnalyses: [
            {
                type: 'scenario',
                description: 'Analyze impact of financial decisions',
                example: {
                    type: 'scenario',
                    variables: {
                        scenarioType: 'Increase Marketing Spend',
                        marketingSpend: 50000,
                        expectedGrowthIncrease: 5,
                    },
                },
            },
            {
                type: 'benchmark',
                description: 'Compare metrics against industry benchmarks',
                example: {
                    type: 'benchmark',
                    benchmarkData: {
                        industry: 'SaaS',
                        stage: 'Series A',
                    },
                },
            },
            {
                type: 'hiring',
                description: 'Analyze affordability of new hires',
                example: {
                    type: 'hiring',
                    hiringData: {
                        roleName: 'Senior Engineer',
                        salary: 150000,
                    },
                },
            },
        ],
        usage: 'POST /api/ai/scenario with type and relevant data',
    })
}

// Helper to get financial context
async function getFinancialContext(userId: string): Promise<FinancialData> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
    })

    // Default values
    let context: FinancialData = {
        cashBalance: 850000,
        burnRate: 65000,
        runway: 13,
        mrr: 42000,
        revenueGrowthMoM: 12,
        headcount: 15,
    }

    if (user?.companyId) {
        const latestSnapshot = await prisma.financialSnapshot.findFirst({
            where: { companyId: user.companyId },
            orderBy: { date: 'desc' },
        })

        if (latestSnapshot) {
            context = {
                cashBalance: latestSnapshot.totalCash,
                burnRate: latestSnapshot.grossBurn,
                runway: latestSnapshot.runway,
                mrr: latestSnapshot.mrr || 0,
            }
        }
    }

    return context
}

// Demo analysis when OpenAI is not configured
function getDemoAnalysis(type: string) {
    switch (type) {
        case 'scenario':
            return {
                scenarioName: 'Increase Marketing Spend',
                summary:
                    'Increasing marketing spend to $50K/mo could accelerate growth to 15% MoM (from 10%) based on typical CAC efficiency. However, this would shorten runway by 3 months unless revenue grows as projected.',
                projectedOutcome: {
                    runwayChange: '-3 months',
                    burnRateChange: '+$25,000/mo',
                    revenueImpact: '+$15,000 MRR in 6 months',
                },
                breakEvenTimeline: '8 months',
                risks: ['Revenue may not grow as projected', 'CAC could be higher than expected'],
                recommendation:
                    'Proceed cautiously. Start with $30K/mo increase and measure CAC before full commitment.',
                confidenceLevel: 'medium',
            }

        case 'benchmark':
            return {
                burnMultiple: {
                    yours: 1.55,
                    benchmark: 1.5,
                    assessment:
                        'Your burn multiple is in line with Series A SaaS averages. You are spending efficiently.',
                },
                overallAssessment:
                    'Your metrics are competitive for a Series A SaaS company. Focus on improving net revenue retention to accelerate growth.',
                improvementAreas: [
                    {
                        area: 'CAC Payback',
                        currentValue: '18 months',
                        targetValue: '12 months',
                        action: 'Improve onboarding to reduce time-to-value',
                    },
                    {
                        area: 'NRR',
                        currentValue: '105%',
                        targetValue: '120%',
                        action: 'Implement expansion revenue motions',
                    },
                ],
            }

        case 'hiring':
            return 'Based on your current runway of 13 months and burn rate of $65K/mo, hiring a Senior Engineer at $150K/year would reduce runway to 11.5 months. This is acceptable if the hire can ship revenue-generating features within 6 months. Consider: (1) starting with a contractor to validate the need, or (2) timing the hire after your next funding milestone.'

        default:
            return { message: 'Demo analysis' }
    }
}
