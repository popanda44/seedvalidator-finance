import { NextResponse } from 'next/server'

// GET /api/expenses - Get expense breakdown by category
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30d'
        const compareWithPrevious = searchParams.get('compare') === 'true'

        // Return sample data (database queries will be added when DB is connected)
        return NextResponse.json(getSampleExpenseData(period, compareWithPrevious))
    } catch (error) {
        console.error('Expenses API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch expense data' },
            { status: 500 }
        )
    }
}

// Sample data generator
function getSampleExpenseData(period: string, compare: boolean) {
    const categories = [
        { id: '1', name: 'Payroll & Benefits', icon: '💼', color: '#3B82F6', amount: 45000, previousAmount: 42000 },
        { id: '2', name: 'Infrastructure', icon: '🖥️', color: '#10B981', amount: 12000, previousAmount: 10500 },
        { id: '3', name: 'Marketing', icon: '📢', color: '#F59E0B', amount: 8000, previousAmount: 9500 },
        { id: '4', name: 'SaaS Tools', icon: '🔧', color: '#8B5CF6', amount: 5500, previousAmount: 5200 },
        { id: '5', name: 'Office & Rent', icon: '🏢', color: '#EC4899', amount: 4000, previousAmount: 4000 },
        { id: '6', name: 'Travel & Meals', icon: '✈️', color: '#06B6D4', amount: 2500, previousAmount: 3200 },
    ]

    const expensesByCategory = categories.map(c => ({
        ...c,
        change: ((c.amount - c.previousAmount) / c.previousAmount) * 100,
        transactionCount: Math.floor(Math.random() * 20) + 5,
    }))

    const totalExpenses = expensesByCategory.reduce((s, e) => s + e.amount, 0)
    const previousTotal = expensesByCategory.reduce((s, e) => s + e.previousAmount, 0)

    return {
        period,
        expensesByCategory,
        summary: {
            totalExpenses,
            previousTotal,
            totalChange: ((totalExpenses - previousTotal) / previousTotal) * 100,
            transactionCount: 156,
        },
        topVendors: [
            { name: 'AWS', amount: 8000, category: 'Infrastructure', trend: 12 },
            { name: 'Gusto', amount: 45000, category: 'Payroll', trend: 7 },
            { name: 'Google Ads', amount: 3500, category: 'Marketing', trend: -15 },
            { name: 'WeWork', amount: 3500, category: 'Office', trend: 0 },
            { name: 'Slack', amount: 1200, category: 'SaaS', trend: 5 },
        ],
    }
}
