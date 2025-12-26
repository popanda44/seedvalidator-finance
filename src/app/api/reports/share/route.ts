import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { randomBytes } from 'crypto'

// In-memory store for shared reports (in production, use database)
// This would be replaced with Prisma/database storage
const sharedReports = new Map<
  string,
  {
    token: string
    reportData: any
    createdAt: Date
    expiresAt: Date
    createdBy: string
    views: number
  }
>()

// Generate unique token
function generateToken(): string {
  return randomBytes(16).toString('hex')
}

// POST: Create a shareable link
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { reportType, period, expiresInDays = 7 } = body

    // Generate unique token
    const token = generateToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000)

    // Generate report data (in production, fetch from database)
    const reportData = {
      title: reportType === 'executive' ? 'Executive Summary' : 'Financial Report',
      companyName: session.user.name || 'Your Company',
      period: period,
      generatedAt: now.toISOString(),
      metrics: {
        cashBalance: 842500,
        burnRate: 85000,
        runway: 9.9,
        mrr: 125000,
        mrrChange: 12.5,
        arr: 1500000,
      },
      expenses: [
        { category: 'Payroll', amount: 45200, percentage: 53 },
        { category: 'Infrastructure', amount: 12450, percentage: 15 },
        { category: 'Marketing', amount: 8900, percentage: 10 },
        { category: 'Operations', amount: 8500, percentage: 10 },
        { category: 'Software', amount: 6500, percentage: 8 },
        { category: 'Other', amount: 3450, percentage: 4 },
      ],
      cashFlow: [
        { month: 'Jul', inflow: 120000, outflow: 92000 },
        { month: 'Aug', inflow: 125000, outflow: 103000 },
        { month: 'Sep', inflow: 118000, outflow: 108000 },
        { month: 'Oct', inflow: 132000, outflow: 127000 },
        { month: 'Nov', inflow: 128000, outflow: 140000 },
        { month: 'Dec', inflow: 145000, outflow: 125000 },
      ],
      summary:
        'This period shows strong financial performance with MRR growing 12.5% month-over-month. Cash runway remains healthy at 9.9 months. Key drivers include new customer acquisition and reduced churn.',
    }

    // Store the shared report
    sharedReports.set(token, {
      token,
      reportData,
      createdAt: now,
      expiresAt,
      createdBy: session.user.email || session.user.id || 'unknown',
      views: 0,
    })

    // Generate share URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/shared/${token}`

    return NextResponse.json({
      success: true,
      token,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Share report error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}

// GET: Retrieve a shared report by token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const sharedReport = sharedReports.get(token)

    if (!sharedReport) {
      return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 })
    }

    // Check expiration
    if (new Date() > sharedReport.expiresAt) {
      sharedReports.delete(token)
      return NextResponse.json({ error: 'Report link has expired' }, { status: 410 })
    }

    // Increment view count
    sharedReport.views += 1

    return NextResponse.json({
      success: true,
      report: sharedReport.reportData,
      meta: {
        createdAt: sharedReport.createdAt,
        expiresAt: sharedReport.expiresAt,
        views: sharedReport.views,
      },
    })
  } catch (error) {
    console.error('Get shared report error:', error)
    return NextResponse.json({ error: 'Failed to retrieve report' }, { status: 500 })
  }
}

// DELETE: Revoke a shared link
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const sharedReport = sharedReports.get(token)

    if (!sharedReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Verify ownership
    if (
      sharedReport.createdBy !== session.user.email &&
      sharedReport.createdBy !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    sharedReports.delete(token)

    return NextResponse.json({ success: true, message: 'Share link revoked' })
  } catch (error) {
    console.error('Delete shared report error:', error)
    return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 })
  }
}
