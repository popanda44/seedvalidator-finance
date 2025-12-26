import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/expenses - Get expense breakdown and categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    // For development, return sample data if no companyId
    if (!companyId) {
      return NextResponse.json(getSampleExpenseData())
    }

    // Get transactions grouped by category
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        amount: { gt: 0 }, // Expenses are positive in Plaid
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    })

    // Group by category
    const categoryMap = new Map<
      string,
      {
        name: string
        amount: number
        color: string
        transactions: any[]
      }
    >()

    transactions.forEach((t) => {
      const catName = t.category?.name || 'Uncategorized'
      const existing = categoryMap.get(catName) || {
        name: catName,
        amount: 0,
        color: t.category?.color || '#6B7280',
        transactions: [],
      }
      existing.amount += t.amount
      existing.transactions.push(t)
      categoryMap.set(catName, existing)
    })

    const categories = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)

    const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0)

    return NextResponse.json({
      categories: categories.map((c) => ({
        ...c,
        percentage: (c.amount / totalExpenses) * 100,
        transactionCount: c.transactions.length,
      })),
      summary: {
        totalExpenses,
        transactionCount: transactions.length,
        avgTransactionSize: totalExpenses / transactions.length,
      },
      pieChartData: categories.slice(0, 6).map((c) => ({
        name: c.name,
        value: c.amount,
        color: c.color,
      })),
    })
  } catch (error) {
    console.error('Expenses API error:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

// Sample data for development
function getSampleExpenseData() {
  const categories = [
    {
      id: 1,
      name: 'Payroll & Benefits',
      icon: '💼',
      amount: 45000,
      previousAmount: 42000,
      color: '#3B82F6',
      subcategories: [
        { name: 'Salaries', amount: 38000 },
        { name: 'Benefits', amount: 5000 },
        { name: 'Payroll Taxes', amount: 2000 },
      ],
    },
    {
      id: 2,
      name: 'Infrastructure',
      icon: '🖥️',
      amount: 12000,
      previousAmount: 10500,
      color: '#10B981',
      subcategories: [
        { name: 'AWS', amount: 8000 },
        { name: 'GCP', amount: 2500 },
        { name: 'Vercel', amount: 1500 },
      ],
      alert: 'Up 14% from last month',
    },
    {
      id: 3,
      name: 'Marketing',
      icon: '📢',
      amount: 8000,
      previousAmount: 9500,
      color: '#F59E0B',
      subcategories: [
        { name: 'Ads', amount: 5000 },
        { name: 'Content', amount: 2000 },
        { name: 'Events', amount: 1000 },
      ],
    },
    {
      id: 4,
      name: 'SaaS Tools',
      icon: '🔧',
      amount: 5500,
      previousAmount: 5200,
      color: '#8B5CF6',
      subcategories: [
        { name: 'Slack', amount: 1200 },
        { name: 'Notion', amount: 800 },
        { name: 'GitHub', amount: 1500 },
        { name: 'Others', amount: 2000 },
      ],
    },
    {
      id: 5,
      name: 'Office & Rent',
      icon: '🏢',
      amount: 4000,
      previousAmount: 4000,
      color: '#EC4899',
      subcategories: [
        { name: 'WeWork', amount: 3500 },
        { name: 'Supplies', amount: 500 },
      ],
    },
    {
      id: 6,
      name: 'Travel & Meals',
      icon: '✈️',
      amount: 2500,
      previousAmount: 3200,
      color: '#06B6D4',
      subcategories: [
        { name: 'Flights', amount: 1500 },
        { name: 'Hotels', amount: 600 },
        { name: 'Meals', amount: 400 },
      ],
    },
  ]

  const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0)
  const previousTotal = categories.reduce((sum, c) => sum + c.previousAmount, 0)

  const topVendors = [
    { name: 'AWS', category: 'Infrastructure', amount: 8000, trend: 12 },
    { name: 'Gusto', category: 'Payroll', amount: 45000, trend: 7 },
    { name: 'Google Ads', category: 'Marketing', amount: 3500, trend: -15 },
    { name: 'WeWork', category: 'Office', amount: 3500, trend: 0 },
    { name: 'Slack', category: 'SaaS', amount: 1200, trend: 5 },
  ]

  return {
    categories: categories.map((c) => ({
      ...c,
      percentage: (c.amount / totalExpenses) * 100,
      change: ((c.amount - c.previousAmount) / c.previousAmount) * 100,
    })),
    summary: {
      totalExpenses,
      previousTotal,
      expenseChange: ((totalExpenses - previousTotal) / previousTotal) * 100,
      transactionCount: 156,
    },
    topVendors,
    pieChartData: categories.map((c) => ({
      name: c.name,
      value: c.amount,
      color: c.color,
    })),
    barChartData: categories.map((c) => ({
      name: c.name.split(' ')[0],
      current: c.amount,
      previous: c.previousAmount,
      color: c.color,
    })),
  }
}
