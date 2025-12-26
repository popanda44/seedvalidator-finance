import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/transactions - Get all transactions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // For development, return sample data if no companyId
    if (!companyId) {
      return NextResponse.json(getSampleTransactions())
    }

    // Build where clause
    const where: any = { companyId }
    if (category && category !== 'All') {
      where.category = { name: category }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          bankAccount: {
            select: { name: true },
          },
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ])

    // Calculate totals
    const allTransactions = await prisma.transaction.findMany({
      where: { companyId },
      select: { amount: true },
    })

    const totalInflow = allTransactions
      .filter((t) => t.amount < 0) // In Plaid, negative amounts are credits (income)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalOutflow = allTransactions
      .filter((t) => t.amount > 0) // In Plaid, positive amounts are debits (expenses)
      .reduce((sum, t) => sum + t.amount, 0)

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.merchantName || t.name,
        amount: t.amount > 0 ? -t.amount : Math.abs(t.amount), // Convert to standard format
        category: t.category?.name || 'Uncategorized',
        categoryColor: t.category?.color || '#6B7280',
        account: t.bankAccount?.name || 'Unknown',
        date: t.date,
        status: t.pending ? 'pending' : 'completed',
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      summary: {
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
      },
    })
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// Sample data for development
function getSampleTransactions() {
  const transactions = [
    {
      id: '1',
      name: 'AWS Cloud Services',
      description: 'Monthly infrastructure',
      amount: -12450,
      category: 'Infrastructure',
      categoryColor: '#10B981',
      account: 'Chase Business',
      date: new Date(),
      status: 'completed',
    },
    {
      id: '2',
      name: 'Stripe Payment',
      description: 'Customer payment received',
      amount: 28700,
      category: 'Revenue',
      categoryColor: '#3B82F6',
      account: 'Chase Business',
      date: new Date(Date.now() - 86400000),
      status: 'completed',
    },
    {
      id: '3',
      name: 'Gusto Payroll',
      description: 'Bi-weekly payroll',
      amount: -45200,
      category: 'Payroll',
      categoryColor: '#F59E0B',
      account: 'Chase Business',
      date: new Date(Date.now() - 2 * 86400000),
      status: 'completed',
    },
    {
      id: '4',
      name: 'Google Workspace',
      description: 'Monthly subscription',
      amount: -890,
      category: 'SaaS',
      categoryColor: '#8B5CF6',
      account: 'Mercury',
      date: new Date(Date.now() - 3 * 86400000),
      status: 'completed',
    },
    {
      id: '5',
      name: 'Slack',
      description: 'Team communication',
      amount: -750,
      category: 'SaaS',
      categoryColor: '#8B5CF6',
      account: 'Mercury',
      date: new Date(Date.now() - 4 * 86400000),
      status: 'completed',
    },
    {
      id: '6',
      name: 'Customer Invoice #1234',
      description: 'Enterprise client',
      amount: 15000,
      category: 'Revenue',
      categoryColor: '#3B82F6',
      account: 'Chase Business',
      date: new Date(Date.now() - 5 * 86400000),
      status: 'completed',
    },
    {
      id: '7',
      name: 'GitHub Enterprise',
      description: 'Annual subscription',
      amount: -3200,
      category: 'SaaS',
      categoryColor: '#8B5CF6',
      account: 'Mercury',
      date: new Date(Date.now() - 6 * 86400000),
      status: 'completed',
    },
    {
      id: '8',
      name: 'WeWork Office',
      description: 'Monthly office rent',
      amount: -4500,
      category: 'Office',
      categoryColor: '#EC4899',
      account: 'Chase Business',
      date: new Date(Date.now() - 7 * 86400000),
      status: 'completed',
    },
    {
      id: '9',
      name: 'Facebook Ads',
      description: 'Marketing campaign',
      amount: -2800,
      category: 'Marketing',
      categoryColor: '#F97316',
      account: 'Mercury',
      date: new Date(Date.now() - 8 * 86400000),
      status: 'pending',
    },
    {
      id: '10',
      name: 'Consulting Services',
      description: 'Customer consulting',
      amount: 8500,
      category: 'Revenue',
      categoryColor: '#3B82F6',
      account: 'Chase Business',
      date: new Date(Date.now() - 9 * 86400000),
      status: 'completed',
    },
  ]

  const totalInflow = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalOutflow = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  )

  return {
    transactions,
    pagination: {
      total: transactions.length,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
    summary: {
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
    },
    accounts: [
      {
        id: '1',
        name: 'Chase Business Checking',
        balance: 542000,
        type: 'checking',
        lastSync: new Date(),
      },
      { id: '2', name: 'Mercury', balance: 300500, type: 'checking', lastSync: new Date() },
    ],
  }
}
