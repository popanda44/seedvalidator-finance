import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateFinancialInsights, answerFinancialQuestion } from '@/lib/openai'
import prisma from '@/lib/prisma'

// GET /api/ai/insights - Get AI-generated financial insights
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if OpenAI is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                summary: "AI insights are not configured yet",
                insights: [
                    {
                        type: "recommendation",
                        title: "Set up AI",
                        description: "Add your OpenAI API key to enable AI-powered insights"
                    }
                ],
                healthScore: 50,
                isDemo: true
            })
        }

        // Get user's financial data
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true }
        })

        // Get recent transactions and metrics
        const companyId = user?.companyId

        let cashBalance = 500000 // Default demo values
        let burnRate = 50000
        let runway = 10
        let mrr = 25000

        if (companyId) {
            // Get actual data from snapshots
            const latestSnapshot = await prisma.financialSnapshot.findFirst({
                where: { companyId },
                orderBy: { date: 'desc' }
            })

            if (latestSnapshot) {
                cashBalance = latestSnapshot.totalCash
                burnRate = latestSnapshot.grossBurn
                runway = latestSnapshot.runway
                mrr = latestSnapshot.mrr || 0
            }

            // Get recent transactions for context
            const transactions = await prisma.transaction.findMany({
                where: { companyId },
                orderBy: { date: 'desc' },
                take: 10,
                include: { category: true }
            })

            const recentTransactions = transactions.map(t => ({
                description: t.name,
                amount: t.amount,
                category: t.category?.name || 'Other'
            }))

            const insights = await generateFinancialInsights({
                cashBalance,
                burnRate,
                runway,
                mrr,
                recentTransactions
            })

            return NextResponse.json(insights)
        }

        // Demo insights for users without company data
        const insights = await generateFinancialInsights({
            cashBalance,
            burnRate,
            runway,
            mrr
        })

        return NextResponse.json(insights)

    } catch (error: any) {
        console.error('AI insights error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate insights' },
            { status: 500 }
        )
    }
}

// POST /api/ai/insights - Ask a natural language question
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { question } = await request.json()

        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 })
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                answer: "AI assistant is not configured. Please add your OpenAI API key."
            })
        }

        // Get financial context
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true }
        })

        let context = {
            cashBalance: 500000,
            burnRate: 50000,
            runway: 10,
            mrr: 25000
        }

        if (user?.companyId) {
            const latestSnapshot = await prisma.financialSnapshot.findFirst({
                where: { companyId: user.companyId },
                orderBy: { date: 'desc' }
            })

            if (latestSnapshot) {
                context = {
                    cashBalance: latestSnapshot.totalCash,
                    burnRate: latestSnapshot.grossBurn,
                    runway: latestSnapshot.runway,
                    mrr: latestSnapshot.mrr || 0
                }
            }
        }

        const answer = await answerFinancialQuestion(question, context)

        return NextResponse.json({ answer })

    } catch (error: any) {
        console.error('AI question error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process question' },
            { status: 500 }
        )
    }
}
