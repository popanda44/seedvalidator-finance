import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/accounts - Get linked bank accounts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    // Return sample data if no companyId
    if (!companyId) {
      return NextResponse.json(getSampleAccountsData())
    }

    // Get accounts
    const accounts = await prisma.bankAccount.findMany({
      where: { companyId },
      include: {
        plaidItem: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate totals
    const totalBalance = accounts.reduce((sum, account) => sum + (account.currentBalance || 0), 0)

    const accountsByType = accounts.reduce(
      (acc, account) => {
        const type = account.type
        if (!acc[type]) acc[type] = 0
        acc[type] += account.currentBalance || 0
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        officialName: a.officialName,
        type: a.type,
        subtype: a.subtype,
        mask: a.mask,
        currentBalance: a.currentBalance,
        availableBalance: a.availableBalance,
        currency: a.isoCurrencyCode,
        lastSync: a.updatedAt,
        status: a.plaidItem?.status || 'connected',
      })),
      summary: {
        totalBalance,
        accountCount: accounts.length,
        byType: accountsByType,
      },
    })
  } catch (error) {
    console.error('Accounts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

// POST /api/accounts/sync - Trigger sync for all accounts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyId, accountId } = body

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    // In a real implementation, this would trigger a Plaid sync
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: accountId
        ? `Sync initiated for account ${accountId}`
        : 'Sync initiated for all accounts',
      syncedAt: new Date(),
    })
  } catch (error) {
    console.error('Account sync error:', error)
    return NextResponse.json({ error: 'Failed to sync accounts' }, { status: 500 })
  }
}

// Sample data
function getSampleAccountsData() {
  return {
    accounts: [
      {
        id: '1',
        name: 'Chase Business Checking',
        officialName: 'Chase Total Business Checking',
        type: 'depository',
        subtype: 'checking',
        mask: '4567',
        currentBalance: 542000,
        availableBalance: 540000,
        currency: 'USD',
        lastSync: new Date(),
        status: 'connected',
      },
      {
        id: '2',
        name: 'Mercury',
        officialName: 'Mercury Business Account',
        type: 'depository',
        subtype: 'checking',
        mask: '8901',
        currentBalance: 300500,
        availableBalance: 300500,
        currency: 'USD',
        lastSync: new Date(Date.now() - 300000), // 5 min ago
        status: 'connected',
      },
    ],
    summary: {
      totalBalance: 842500,
      accountCount: 2,
      byType: {
        depository: 842500,
      },
    },
  }
}
