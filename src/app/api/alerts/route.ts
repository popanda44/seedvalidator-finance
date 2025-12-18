import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/alerts - Get alerts
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('companyId')
        const filter = searchParams.get('filter') || 'all' // all, unread, critical, warning, info, success
        const limit = parseInt(searchParams.get('limit') || '50')

        // Return sample data if no companyId
        if (!companyId) {
            return NextResponse.json(getSampleAlertsData(filter))
        }

        // Build where clause
        const where: any = { companyId }

        if (filter === 'unread') {
            where.isRead = false
        } else if (['CRITICAL', 'WARNING', 'INFO', 'SUCCESS'].includes(filter.toUpperCase())) {
            where.severity = filter.toUpperCase()
        }

        // Get alerts
        const alerts = await prisma.alert.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        })

        // Get counts
        const counts = await prisma.alert.groupBy({
            by: ['severity', 'isRead'],
            where: { companyId },
            _count: true,
        })

        const unreadCount = counts
            .filter(c => !c.isRead)
            .reduce((sum, c) => sum + c._count, 0)

        const criticalCount = counts
            .filter(c => c.severity === 'CRITICAL' && !c.isRead)
            .reduce((sum, c) => sum + c._count, 0)

        return NextResponse.json({
            alerts: alerts.map(a => ({
                id: a.id,
                type: a.severity.toLowerCase(),
                title: a.title,
                message: a.message,
                timestamp: a.createdAt,
                isRead: a.isRead,
                isDismissed: a.isDismissed,
                data: a.data,
            })),
            summary: {
                total: alerts.length,
                unreadCount,
                criticalCount,
            },
        })
    } catch (error) {
        console.error('Alerts API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        )
    }
}

// PATCH /api/alerts - Mark alerts as read or dismissed
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { alertIds, action } = body // action: 'read' | 'dismiss' | 'read-all'

        if (!alertIds && action !== 'read-all') {
            return NextResponse.json(
                { error: 'Alert IDs required' },
                { status: 400 }
            )
        }

        if (action === 'read-all') {
            // Mark all as read for company
            const { companyId } = body
            if (!companyId) {
                return NextResponse.json(
                    { error: 'Company ID required for read-all' },
                    { status: 400 }
                )
            }

            await prisma.alert.updateMany({
                where: { companyId, isRead: false },
                data: { isRead: true },
            })

            return NextResponse.json({ success: true, message: 'All alerts marked as read' })
        }

        const updateData = action === 'dismiss'
            ? { isDismissed: true }
            : { isRead: true }

        await prisma.alert.updateMany({
            where: { id: { in: alertIds } },
            data: updateData,
        })

        return NextResponse.json({
            success: true,
            message: `Alerts ${action === 'dismiss' ? 'dismissed' : 'marked as read'}`,
        })
    } catch (error) {
        console.error('Update alerts error:', error)
        return NextResponse.json(
            { error: 'Failed to update alerts' },
            { status: 500 }
        )
    }
}

// Sample data
function getSampleAlertsData(filter: string) {
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
    ]

    let filtered = allAlerts
    if (filter === 'unread') {
        filtered = allAlerts.filter(a => !a.isRead)
    } else if (filter !== 'all') {
        filtered = allAlerts.filter(a => a.type === filter)
    }

    return {
        alerts: filtered,
        summary: {
            total: allAlerts.length,
            unreadCount: allAlerts.filter(a => !a.isRead).length,
            criticalCount: allAlerts.filter(a => a.type === 'critical' && !a.isRead).length,
        },
    }
}
