import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { exchangePublicToken, getAccounts, getInstitution } from '@/lib/plaid'

// POST /api/plaid/exchange-token - Exchange public token for access token
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { publicToken, institutionId, companyId, userId } = body

    if (!publicToken || !companyId) {
      return NextResponse.json(
        { error: 'Public token and Company ID are required' },
        { status: 400 }
      )
    }

    // Check if Plaid is configured
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      // Return mock data for development
      return NextResponse.json({
        success: true,
        isDevelopment: true,
        item: {
          id: 'mock-item-' + Date.now(),
          institutionName: 'Chase (Mock)',
        },
        accounts: [
          {
            id: 'mock-account-1',
            name: 'Business Checking',
            mask: '4567',
            type: 'depository',
            subtype: 'checking',
            balance: 542000,
          },
          {
            id: 'mock-account-2',
            name: 'Business Savings',
            mask: '8901',
            type: 'depository',
            subtype: 'savings',
            balance: 150000,
          },
        ],
        message: 'Using development mode - Plaid not configured',
      })
    }

    // Exchange the public token
    const { accessToken, itemId } = await exchangePublicToken(publicToken)

    // Get institution info
    let institutionName = 'Unknown Bank'
    if (institutionId) {
      try {
        const institution = await getInstitution(institutionId)
        institutionName = institution.name
      } catch (e) {
        console.warn('Could not get institution info:', e)
      }
    }

    // Get accounts
    const plaidAccounts = await getAccounts(accessToken)

    // Store PlaidItem in database
    const plaidItem = await prisma.plaidItem.create({
      data: {
        companyId,
        plaidItemId: itemId,
        accessToken,
        institutionId: institutionId || undefined,
        institutionName,
        status: 'ACTIVE',
      },
    })

    // Store bank accounts
    const accounts = await Promise.all(
      plaidAccounts.map((account) =>
        prisma.bankAccount.create({
          data: {
            companyId,
            plaidItemId: plaidItem.id,
            plaidAccountId: account.account_id,
            name: account.name,
            officialName: account.official_name,
            type: account.type as any,
            subtype: account.subtype || undefined,
            mask: account.mask,
            currentBalance: account.balances.current || 0,
            availableBalance: account.balances.available,
            isoCurrencyCode: account.balances.iso_currency_code || 'USD',
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      item: {
        id: plaidItem.id,
        institutionName,
      },
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        mask: a.mask,
        type: a.type,
        subtype: a.subtype,
        balance: a.currentBalance,
      })),
    })
  } catch (error: any) {
    console.error('Exchange token error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to exchange token' },
      { status: 500 }
    )
  }
}
