import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
})

export const plaidClient = new PlaidApi(configuration)

/**
 * Create a link token for Plaid Link
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createLinkToken(userId: string, _companyId: string) {
    // Use the production URL or fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'https://potent-fin.vercel.app'

    const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'SeedValidator Finance',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: `${appUrl}/api/plaid/webhook`,
    })

    return response.data.link_token
}

/**
 * Exchange public token for access token
 */
export async function exchangePublicToken(publicToken: string) {
    const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    })

    return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
    }
}

/**
 * Get institution info
 */
export async function getInstitution(institutionId: string) {
    const response = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
    })

    return response.data.institution
}

/**
 * Get accounts for an item
 */
export async function getAccounts(accessToken: string) {
    const response = await plaidClient.accountsGet({
        access_token: accessToken,
    })

    return response.data.accounts
}

/**
 * Sync transactions (incremental)
 */
export async function syncTransactions(accessToken: string, cursor?: string) {
    const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        count: 500,
    })

    return {
        added: response.data.added,
        modified: response.data.modified,
        removed: response.data.removed,
        nextCursor: response.data.next_cursor,
        hasMore: response.data.has_more,
    }
}

/**
 * Get balances
 */
export async function getBalances(accessToken: string) {
    const response = await plaidClient.accountsBalanceGet({
        access_token: accessToken,
    })

    return response.data.accounts
}

/**
 * Remove an item (disconnect bank)
 */
export async function removeItem(accessToken: string) {
    await plaidClient.itemRemove({
        access_token: accessToken,
    })
}

/**
 * Map Plaid categories to our categories
 */
export function mapPlaidCategory(plaidCategories: string[]): string {
    const categoryMap: Record<string, string> = {
        // Income
        'INCOME': 'income',
        'TRANSFER_IN': 'income',

        // Payroll
        'PAYROLL': 'payroll',

        // Technology
        'COMPUTERS_AND_ELECTRONICS': 'technology',
        'COMPUTER_SOFTWARE': 'technology',

        // Marketing
        'ADVERTISING': 'marketing',
        'MARKETING': 'marketing',

        // Office
        'RENT': 'office',
        'UTILITIES': 'office',
        'OFFICE_SUPPLIES': 'office',

        // Travel
        'TRAVEL': 'travel',
        'AIRLINES': 'travel',
        'HOTELS': 'travel',

        // Food
        'FOOD_AND_DRINK': 'food',
        'RESTAURANTS': 'food',

        // Professional Services
        'LEGAL': 'professional-services',
        'ACCOUNTING': 'professional-services',

        // Default
        'GENERAL_SERVICES': 'other',
        'GENERAL_MERCHANDISE': 'other',
    }

    for (const category of plaidCategories) {
        if (categoryMap[category]) {
            return categoryMap[category]
        }
    }

    return 'other'
}

export default plaidClient
