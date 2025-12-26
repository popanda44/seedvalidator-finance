import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateRunway, calculateBurnRate } from '@/lib/utils'

// GET /api/dashboard - Get dashboard summary data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    // For development, return sample data if no companyId
    if (!companyId) {
      return NextResponse.json(getSampleDashboardData())
    }

    // Get company with relations
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        bankAccounts: true,
        transactions: {
          take: 10,
          orderBy: { date: 'desc' },
          include: { category: true },
        },
        alerts: {
          where: { isRead: false },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        snapshots: {
          take: 12,
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Calculate metrics
    const totalCash = company.bankAccounts.reduce(
      (sum, account) => sum + (account.currentBalance || 0),
      0
    )

    const latestSnapshot = company.snapshots[0]
    const previousSnapshot = company.snapshots[1]

    const monthlyBurn = latestSnapshot?.grossBurn || 0
    const previousBurn = previousSnapshot?.grossBurn || 0
    const burnChange = previousBurn > 0 ? ((monthlyBurn - previousBurn) / previousBurn) * 100 : 0

    const mrr = latestSnapshot?.mrr || 0
    const previousMrr = previousSnapshot?.mrr || 0
    const mrrChange = previousMrr > 0 ? ((mrr - previousMrr) / previousMrr) * 100 : 0

    const runway = calculateRunway(totalCash, monthlyBurn)
    const netBurn = monthlyBurn - mrr

    // Format recent transactions
    const recentTransactions = company.transactions.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.merchantName || t.name,
      amount: t.amount,
      category: t.category?.name || 'Uncategorized',
      categoryColor: t.category?.color || '#6B7280',
      date: t.date,
      status: t.pending ? 'pending' : 'completed',
    }))

    // Format alerts
    const alerts = company.alerts.map((a) => ({
      id: a.id,
      type: a.severity.toLowerCase(),
      title: a.title,
      message: a.message,
      timestamp: a.createdAt,
      isRead: a.isRead,
    }))

    // Build burn trend data from snapshots
    const burnTrend = company.snapshots.reverse().map((s) => ({
      month: s.date.toLocaleDateString('en-US', { month: 'short' }),
      grossBurn: s.grossBurn,
      netBurn: s.netBurn,
      revenue: s.revenue || s.mrr,
    }))

    return NextResponse.json({
      metrics: {
        cashBalance: totalCash,
        monthlyBurn,
        burnChange,
        runway,
        mrr,
        mrrChange,
        netBurn,
        teamSize: 0, // Would come from separate model if tracked
      },
      recentTransactions,
      alerts,
      burnTrend,
      accounts: company.bankAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.currentBalance,
        type: a.type,
        lastSync: a.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

// Sample data for development
function getSampleDashboardData() {
  return {
    metrics: {
      cashBalance: 842500,
      monthlyBurn: 85000,
      burnChange: -5.2,
      runway: 9.9,
      mrr: 125000,
      mrrChange: 12.5,
      netBurn: -40000,
      teamSize: 12,
    },
    recentTransactions: [
      {
        id: '1',
        name: 'AWS Cloud Services',
        description: 'Monthly infrastructure',
        amount: -12450,
        category: 'Infrastructure',
        categoryColor: '#10B981',
        date: new Date(),
        status: 'completed',
      },
      {
        id: '2',
        name: 'Stripe Payment',
        description: 'Customer payment',
        amount: 28700,
        category: 'Revenue',
        categoryColor: '#3B82F6',
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
        date: new Date(Date.now() - 3 * 86400000),
        status: 'completed',
      },
    ],
    alerts: [
      {
        id: '1',
        type: 'critical',
        title: 'Runway below 6 months',
        message: 'Consider reducing burn or raising funds',
        timestamp: new Date(),
        isRead: false,
      },
      {
        id: '2',
        type: 'warning',
        title: 'Infrastructure costs up 15%',
        message: 'AWS spending increased this month',
        timestamp: new Date(Date.now() - 86400000),
        isRead: false,
      },
    ],
    burnTrend: [
      { month: 'Jul', grossBurn: 78000, netBurn: 28000, revenue: 50000 },
      { month: 'Aug', grossBurn: 82000, netBurn: 22000, revenue: 60000 },
      { month: 'Sep', grossBurn: 80000, netBurn: 10000, revenue: 70000 },
      { month: 'Oct', grossBurn: 85000, netBurn: 5000, revenue: 80000 },
      { month: 'Nov', grossBurn: 88000, netBurn: -12000, revenue: 100000 },
      { month: 'Dec', grossBurn: 85000, netBurn: -40000, revenue: 125000 },
    ],
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
