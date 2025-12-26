import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateCFOBriefing, type FinancialData } from '@/lib/openai'
import prisma from '@/lib/prisma'

// GET /api/ai/briefing - Generate weekly CFO briefing
export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if OpenAI is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(getDemoBriefing(), { status: 200 })
        }

        // Get user's financial data
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true },
        })

        const companyId = user?.companyId

        // Default demo data
        let financialData: FinancialData = {
            cashBalance: 850000,
            burnRate: 65000,
            runway: 13,
            mrr: 42000,
            revenueGrowthMoM: 12,
            headcount: 15,
            topExpenseCategory: 'Payroll',
            topExpenseAmount: 45000,
        }

        if (companyId) {
            // Get actual data
            const latestSnapshot = await prisma.financialSnapshot.findFirst({
                where: { companyId },
                orderBy: { date: 'desc' },
            })

            const previousSnapshot = await prisma.financialSnapshot.findFirst({
                where: { companyId },
                orderBy: { date: 'desc' },
                skip: 1,
            })

            if (latestSnapshot) {
                const prevMrr = previousSnapshot?.mrr || latestSnapshot.mrr || 0
                const currentMrr = latestSnapshot.mrr || 0
                const growthRate = prevMrr > 0 ? ((currentMrr - prevMrr) / prevMrr) * 100 : 0

                financialData = {
                    cashBalance: latestSnapshot.totalCash,
                    burnRate: latestSnapshot.grossBurn,
                    runway: latestSnapshot.runway,
                    mrr: currentMrr,
                    revenueGrowthMoM: growthRate,
                }
            }

            // Get top expense category
            const expenses = await prisma.transaction.groupBy({
                by: ['categoryId'],
                where: {
                    companyId,
                    amount: { lt: 0 },
                    date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'asc' } },
                take: 1,
            })

            if (expenses[0]?.categoryId) {
                const category = await prisma.category.findUnique({
                    where: { id: expenses[0].categoryId },
                })
                financialData.topExpenseCategory = category?.name || 'Operating'
                financialData.topExpenseAmount = Math.abs(expenses[0]._sum.amount || 0)
            }
        }

        const briefing = await generateCFOBriefing(financialData)

        return NextResponse.json({
            success: true,
            briefing,
            generatedAt: new Date().toISOString(),
            dataSnapshot: {
                runway: financialData.runway,
                burnRate: financialData.burnRate,
                mrr: financialData.mrr,
            },
        })
    } catch (error: any) {
        console.error('CFO briefing error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate briefing' },
            { status: 500 }
        )
    }
}

// Demo briefing when OpenAI is not configured
function getDemoBriefing() {
    return {
        success: true,
        isDemo: true,
        briefing: {
            executiveSummary:
                'Your company is in a healthy financial position with 13 months of runway. Revenue growth of 12% MoM indicates strong product-market fit.',
            actionItems: [
                {
                    priority: 'high',
                    action: 'Review AWS costs - usage increased 25% without corresponding revenue growth',
                    expectedImpact: 'Potential $3,200/mo savings',
                    timeframe: 'This week',
                },
                {
                    priority: 'medium',
                    action: 'Negotiate annual contracts with top 3 SaaS vendors',
                    expectedImpact: '15-20% discount = $1,800/mo savings',
                    timeframe: 'This month',
                },
                {
                    priority: 'low',
                    action: 'Document Q1 budgets before next board meeting',
                    expectedImpact: 'Board preparedness',
                    timeframe: 'This quarter',
                },
            ],
            risksToMonitor: [
                {
                    risk: 'Payroll costs approaching 70% of burn rate',
                    severity: 'warning',
                    mitigation: 'Consider contractor-to-FTE conversion timing',
                },
                {
                    risk: 'Customer concentration: Top 3 customers = 35% of MRR',
                    severity: 'warning',
                    mitigation: 'Accelerate pipeline diversification',
                },
            ],
            metrics: {
                runwayStatus: 'healthy',
                burnEfficiency: 'Spending $1.55 per $1 of MRR generated - within Series A norms',
                growthTrajectory: 'On track for $600K ARR by Q2',
            },
        },
        generatedAt: new Date().toISOString(),
    }
}
