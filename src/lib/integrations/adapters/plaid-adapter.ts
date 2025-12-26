/**
 * FinYeld AI - Plaid Integration Adapter
 * Implements FinancialIntegration interface for Plaid banking data
 */

import {
    BaseIntegration,
    Transaction,
    Account,
    SyncResult,
    WebhookEvent,
    IntegrationStatus,
    IntegrationCredentials,
    AuthenticationError,
    DataSyncError,
    RateLimitError,
    withRetry,
} from '../types'
import {
    plaidClient,
    exchangePublicToken,
    syncTransactions as plaidSyncTransactions,
    getAccounts as plaidGetAccounts,
    getBalances as plaidGetBalances,
    removeItem,
    mapPlaidCategory,
} from '@/lib/plaid'
import prisma from '@/lib/prisma'

export class PlaidIntegration extends BaseIntegration {
    readonly name = 'Plaid'
    readonly tier = 1 as const

    private itemId?: string
    private cursor?: string

    constructor(companyId: string) {
        super(companyId)
    }

    async connect(credentials: IntegrationCredentials): Promise<void> {
        if (!credentials.publicToken) {
            throw new AuthenticationError(this.name, false)
        }

        try {
            this.log('info', 'Connecting to Plaid...')

            // Exchange public token for access token
            const { accessToken, itemId } = await exchangePublicToken(credentials.publicToken)

            this.accessToken = accessToken
            this.itemId = itemId

            // Store in database
            await prisma.integration.upsert({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'PLAID',
                    },
                },
                update: {
                    accessToken,
                    status: 'ACTIVE',
                    config: { itemId },
                    lastSyncAt: new Date(),
                },
                create: {
                    companyId: this.companyId,
                    integrationType: 'PLAID',
                    accessToken,
                    status: 'ACTIVE',
                    config: { itemId },
                },
            })

            this.log('info', 'Successfully connected to Plaid')
        } catch (error: any) {
            this.log('error', 'Failed to connect to Plaid', error)

            if (error?.response?.status === 429) {
                throw new RateLimitError(this.name, 60)
            }

            throw new AuthenticationError(this.name, true)
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.accessToken) {
                await removeItem(this.accessToken)
            }

            await prisma.integration.update({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'PLAID',
                    },
                },
                data: {
                    status: 'INACTIVE',
                    accessToken: null,
                    refreshToken: null,
                },
            })

            this.accessToken = undefined
            this.itemId = undefined
            this.cursor = undefined

            this.log('info', 'Disconnected from Plaid')
        } catch (error) {
            this.log('error', 'Failed to disconnect from Plaid', error)
            throw new DataSyncError(this.name, 'Failed to disconnect')
        }
    }

    async syncTransactions(startDate: Date, endDate: Date): Promise<SyncResult> {
        await this.ensureConnected()

        const result: SyncResult = {
            success: false,
            transactionsAdded: 0,
            transactionsModified: 0,
            transactionsRemoved: 0,
            errors: [],
        }

        try {
            this.log('info', `Syncing transactions from ${startDate.toISOString()} to ${endDate.toISOString()}`)

            // Use incremental sync with cursor
            let hasMore = true
            let totalAdded = 0
            let totalModified = 0
            let totalRemoved = 0

            while (hasMore) {
                const syncResult = await withRetry(
                    () => plaidSyncTransactions(this.accessToken!, this.cursor),
                    {
                        maxRetries: 3,
                        onRetry: (attempt, error) => {
                            this.log('warn', `Retry attempt ${attempt} for sync`, error.message)
                        },
                    }
                )

                // Process added transactions
                for (const tx of syncResult.added) {
                    await this.saveTransaction({
                        id: tx.transaction_id,
                        externalId: tx.transaction_id,
                        amount: tx.amount * -1, // Plaid uses negative for debits
                        date: new Date(tx.date),
                        description: tx.name,
                        merchant: tx.merchant_name || undefined,
                        category: mapPlaidCategory(tx.personal_finance_category?.primary ? [tx.personal_finance_category.primary] : tx.category || []),
                        accountId: tx.account_id,
                        pending: tx.pending,
                    })
                    totalAdded++
                }

                // Process modified transactions
                for (const tx of syncResult.modified) {
                    await this.saveTransaction({
                        id: tx.transaction_id,
                        externalId: tx.transaction_id,
                        amount: tx.amount * -1,
                        date: new Date(tx.date),
                        description: tx.name,
                        merchant: tx.merchant_name || undefined,
                        category: mapPlaidCategory(tx.personal_finance_category?.primary ? [tx.personal_finance_category.primary] : tx.category || []),
                        accountId: tx.account_id,
                        pending: tx.pending,
                    })
                    totalModified++
                }

                // Process removed transactions
                for (const removed of syncResult.removed) {
                    await this.removeTransaction(removed.transaction_id)
                    totalRemoved++
                }

                this.cursor = syncResult.nextCursor
                hasMore = syncResult.hasMore
                result.cursor = syncResult.nextCursor
            }

            result.success = true
            result.transactionsAdded = totalAdded
            result.transactionsModified = totalModified
            result.transactionsRemoved = totalRemoved
            result.hasMore = false

            // Update integration status
            await prisma.integration.update({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'PLAID',
                    },
                },
                data: {
                    lastSyncAt: new Date(),
                    config: {
                        itemId: this.itemId,
                        cursor: this.cursor,
                    },
                },
            })

            this.log('info', `Sync completed: +${totalAdded} ~${totalModified} -${totalRemoved}`)
        } catch (error: any) {
            this.log('error', 'Transaction sync failed', error)

            if (error?.response?.status === 400 && error?.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
                throw new AuthenticationError(this.name, true)
            }

            result.errors.push(error.message)
            throw new DataSyncError(
                this.name,
                error.message,
                result.transactionsAdded > 0,
                result.transactionsAdded
            )
        }

        return result
    }

    async getAccounts(): Promise<Account[]> {
        await this.ensureConnected()

        try {
            const accounts = await plaidGetAccounts(this.accessToken!)

            return accounts.map((acc) => ({
                id: acc.account_id,
                externalId: acc.account_id,
                name: acc.name,
                type: this.mapAccountType(acc.type),
                subtype: acc.subtype || undefined,
                balance: acc.balances.current || 0,
                availableBalance: acc.balances.available || undefined,
                currency: acc.balances.iso_currency_code || 'USD',
                institutionName: acc.official_name || undefined,
            }))
        } catch (error: any) {
            this.log('error', 'Failed to get accounts', error)
            throw new DataSyncError(this.name, 'Failed to get accounts')
        }
    }

    async getAccountBalance(accountId: string): Promise<number> {
        await this.ensureConnected()

        try {
            const accounts = await plaidGetBalances(this.accessToken!)
            const account = accounts.find((acc) => acc.account_id === accountId)

            if (!account) {
                throw new DataSyncError(this.name, `Account ${accountId} not found`)
            }

            return account.balances.current || 0
        } catch (error: any) {
            this.log('error', 'Failed to get balance', error)
            throw new DataSyncError(this.name, 'Failed to get balance')
        }
    }

    async handleWebhook(event: WebhookEvent): Promise<void> {
        this.log('info', `Received webhook: ${event.type}`, event.payload)

        const payload = event.payload as {
            webhook_type: string
            webhook_code: string
            item_id: string
            error?: { error_code: string }
        }

        switch (payload.webhook_type) {
            case 'TRANSACTIONS':
                if (payload.webhook_code === 'SYNC_UPDATES_AVAILABLE') {
                    // Queue a transaction sync
                    this.log('info', 'New transactions available, queueing sync')
                    // In production, queue this to a job processor
                    const now = new Date()
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    await this.syncTransactions(thirtyDaysAgo, now)
                }
                break

            case 'ITEM':
                if (payload.webhook_code === 'ERROR') {
                    this.log('error', 'Plaid item error', payload.error)
                    // Mark integration as needing attention
                    await prisma.integration.update({
                        where: {
                            companyId_integrationType: {
                                companyId: this.companyId,
                                integrationType: 'PLAID',
                            },
                        },
                        data: {
                            status: 'ERROR',
                        },
                    })
                } else if (payload.webhook_code === 'PENDING_EXPIRATION') {
                    this.log('warn', 'Plaid item expiring soon')
                    // Notify user to reconnect
                }
                break

            default:
                this.log('info', `Unhandled webhook type: ${payload.webhook_type}`)
        }
    }

    async refreshAuth(): Promise<void> {
        // Plaid uses persistent access tokens, no refresh needed
        // But we should verify the token is still valid
        try {
            await this.ensureConnected()
            await plaidGetAccounts(this.accessToken!)
        } catch {
            throw new AuthenticationError(this.name, true)
        }
    }

    async getStatus(): Promise<IntegrationStatus> {
        const integration = await prisma.integration.findUnique({
            where: {
                companyId_integrationType: {
                    companyId: this.companyId,
                    integrationType: 'PLAID',
                },
            },
        })

        if (!integration) {
            return {
                isConnected: false,
                lastSyncStatus: 'pending',
                syncedTransactions: 0,
                accountsConnected: 0,
            }
        }

        const transactionCount = await prisma.transaction.count({
            where: { companyId: this.companyId },
        })

        const accountCount = await prisma.bankAccount.count({
            where: { companyId: this.companyId },
        })

        return {
            isConnected: integration.status === 'ACTIVE',
            lastSyncAt: integration.lastSyncAt || undefined,
            lastSyncStatus: integration.status === 'ACTIVE' ? 'success' : 'failed',
            syncedTransactions: transactionCount,
            accountsConnected: accountCount,
        }
    }

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================
    private async ensureConnected(): Promise<void> {
        if (!this.accessToken) {
            // Try to load from database
            const integration = await prisma.integration.findUnique({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'PLAID',
                    },
                },
            })

            if (!integration?.accessToken) {
                throw new AuthenticationError(this.name, true)
            }

            this.accessToken = integration.accessToken
            const config = integration.config as { itemId?: string; cursor?: string } | null
            this.itemId = config?.itemId
            this.cursor = config?.cursor
        }
    }

    private async saveTransaction(tx: Transaction): Promise<void> {
        // Find or create category
        let categoryId: string | undefined

        const category = await prisma.category.findFirst({
            where: {
                companyId: this.companyId,
                name: { equals: tx.category, mode: 'insensitive' },
            },
        })

        if (category) {
            categoryId = category.id
        } else {
            const newCategory = await prisma.category.create({
                data: {
                    name: tx.category,
                    type: tx.amount < 0 ? 'expense' : 'income',
                    companyId: this.companyId,
                },
            })
            categoryId = newCategory.id
        }

        await prisma.transaction.upsert({
            where: {
                companyId_externalId: {
                    companyId: this.companyId,
                    externalId: tx.externalId!,
                },
            },
            update: {
                amount: tx.amount,
                date: tx.date,
                name: tx.description,
                categoryId,
            },
            create: {
                companyId: this.companyId,
                externalId: tx.externalId!,
                amount: tx.amount,
                date: tx.date,
                name: tx.description,
                categoryId,
            },
        })
    }

    private async removeTransaction(externalId: string): Promise<void> {
        await prisma.transaction.deleteMany({
            where: {
                companyId: this.companyId,
                externalId,
            },
        })
    }

    private mapAccountType(plaidType: string): Account['type'] {
        const typeMap: Record<string, Account['type']> = {
            depository: 'checking',
            credit: 'credit',
            investment: 'investment',
            loan: 'other',
            brokerage: 'investment',
        }
        return typeMap[plaidType] || 'other'
    }
}
