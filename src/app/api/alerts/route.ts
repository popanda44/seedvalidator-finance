import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/alerts - Get all alerts for a company
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const filter = searchParams.get('filter') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    // For development, return sample data if no companyId
    if (!companyId) {
      return NextResponse.json(getSampleAlerts(filter))
    }

    // Build where clause
    const where: any = { companyId }

    if (filter === 'unread') {
      where.isRead = false
    } else if (filter !== 'all') {
      where.type = filter.toUpperCase()
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Get counts
    const [total, unread, critical] = await Promise.all([
      prisma.alert.count({ where: { companyId, isDismissed: false } }),
      prisma.alert.count({ where: { companyId, isRead: false, isDismissed: false } }),
      prisma.alert.count({ where: { companyId, severity: 'CRITICAL', isDismissed: false } }),
    ])

    return NextResponse.json({
      alerts: alerts.map((a) => ({
        id: a.id,
        type: a.severity.toLowerCase(),
        title: a.title,
        message: a.message,
        timestamp: a.createdAt,
        isRead: a.isRead,
        isDismissed: a.isDismissed,
        data: a.data,
      })),
      counts: {
        total,
        unread,
        critical,
        success: alerts.filter((a) => a.type === 'WEEKLY_DIGEST').length,
      },
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

// PATCH /api/alerts - Update alert status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isRead, isDismissed } = body

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead
      if (isRead) updateData.readAt = new Date()
    }
    if (typeof isDismissed === 'boolean') {
      updateData.isDismissed = isDismissed
      if (isDismissed) updateData.dismissedAt = new Date()
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    console.error('Alert update error:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

// Sample data for development
function getSampleAlerts(filter: string) {
  const allAlerts = [
    {
      id: '1',
      type: 'critical',
      title: 'Runway below 6 months',
      message: 'Your current runway is 5.8 months. Consider reducing burn rate or raising funds.',
      timestamp: new Date(Date.now() - 2 * 3600000),
      isRead: false,
      isDismissed: false,
      data: { amount: 5.8 },
    },
    {
      id: '2',
      type: 'warning',
      title: 'Infrastructure spending up 45%',
      message: 'AWS costs increased significantly this month compared to last month.',
      timestamp: new Date(Date.now() - 24 * 3600000),
      isRead: false,
      isDismissed: false,
      data: { category: 'Infrastructure', change: 45 },
    },
    {
      id: '3',
      type: 'info',
      title: 'Large transaction detected',
      message: 'A transaction of $15,000 was recorded from Stripe.',
      timestamp: new Date(Date.now() - 2 * 24 * 3600000),
      isRead: true,
      isDismissed: false,
      data: { amount: 15000 },
    },
    {
      id: '4',
      type: 'success',
      title: 'MRR grew 12% this month',
      message: 'Strong month-over-month growth. Your MRR is now $125,000.',
      timestamp: new Date(Date.now() - 3 * 24 * 3600000),
      isRead: true,
      isDismissed: false,
      data: { amount: 125000, change: 12 },
    },
    {
      id: '5',
      type: 'warning',
      title: 'Payment due in 7 days',
      message: 'Annual AWS payment of $45,000 is due on December 25.',
      timestamp: new Date(Date.now() - 4 * 24 * 3600000),
      isRead: true,
      isDismissed: false,
      data: { amount: 45000 },
    },
    {
      id: '6',
      type: 'info',
      title: 'Weekly digest available',
      message: 'Your weekly financial summary is ready to view.',
      timestamp: new Date(Date.now() - 5 * 24 * 3600000),
      isRead: true,
      isDismissed: false,
    },
    {
      id: '7',
      type: 'success',
      title: 'Bank account synced',
      message: 'Chase Business Checking successfully synced with 23 new transactions.',
      timestamp: new Date(Date.now() - 6 * 24 * 3600000),
      isRead: true,
      isDismissed: false,
    },
  ]

  let filteredAlerts = allAlerts
  if (filter === 'unread') {
    filteredAlerts = allAlerts.filter((a) => !a.isRead)
  } else if (filter !== 'all') {
    filteredAlerts = allAlerts.filter((a) => a.type === filter)
  }

  return {
    alerts: filteredAlerts,
    counts: {
      total: allAlerts.length,
      unread: allAlerts.filter((a) => !a.isRead).length,
      critical: allAlerts.filter((a) => a.type === 'critical').length,
      success: allAlerts.filter((a) => a.type === 'success').length,
    },
  }
}
