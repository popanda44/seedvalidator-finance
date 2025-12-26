/**
 * FinYeld AI - Stripe Integration Adapter
 * Implements FinancialIntegration interface for Stripe revenue data
 */

import Stripe from 'stripe'
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
    ConfigurationError,
    withRetry,
} from '../types'
import prisma from '@/lib/prisma'

// Initialize Stripe client
const getStripeClient = () => {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
        throw new ConfigurationError('Stripe', 'STRIPE_SECRET_KEY not configured')
    }
    return new Stripe(apiKey, { apiVersion: '2024-11-20.acacia' })
}

export class StripeIntegration extends BaseIntegration {
    readonly name = 'Stripe'
    readonly tier = 1 as const

    private stripe: Stripe | null = null
    private connectedAccountId?: string

    constructor(companyId: string) {
        super(companyId)
    }

    private getClient(): Stripe {
        if (!this.stripe) {
            this.stripe = getStripeClient()
        }
        return this.stripe
    }

    async connect(credentials: IntegrationCredentials): Promise<void> {
        try {
            this.log('info', 'Connecting to Stripe...')

            const stripe = this.getClient()

            // If using Connect, store the connected account ID
            if (credentials.metadata?.connectedAccountId) {
                this.connectedAccountId = credentials.metadata.connectedAccountId as string
            }

            // Verify connection by fetching account info
            const account = this.connectedAccountId
                ? await stripe.accounts.retrieve(this.connectedAccountId)
                : await stripe.account.retrieve()

            // Store in database
            await prisma.integration.upsert({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'STRIPE',
                    },
                },
                update: {
                    status: 'ACTIVE',
                    config: {
                        accountId: account.id,
                        accountName: account.business_profile?.name || account.email,
                        connectedAccountId: this.connectedAccountId,
                    },
                    lastSyncAt: new Date(),
                },
                create: {
                    companyId: this.companyId,
                    integrationType: 'STRIPE',
                    status: 'ACTIVE',
                    config: {
                        accountId: account.id,
                        accountName: account.business_profile?.name || account.email,
                        connectedAccountId: this.connectedAccountId,
                    },
                },
            })

            this.log('info', `Connected to Stripe account: ${account.id}`)
        } catch (error: any) {
            this.log('error', 'Failed to connect to Stripe', error)
            throw new AuthenticationError(this.name, true)
        }
    }

    async disconnect(): Promise<void> {
        try {
            await prisma.integration.update({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'STRIPE',
                    },
                },
                data: {
                    status: 'INACTIVE',
                },
            })

            this.connectedAccountId = undefined
            this.log('info', 'Disconnected from Stripe')
        } catch (error) {
            this.log('error', 'Failed to disconnect from Stripe', error)
            throw new DataSyncError(this.name, 'Failed to disconnect')
        }
    }

    async syncTransactions(startDate: Date, endDate: Date): Promise<SyncResult> {
        const result: SyncResult = {
            success: false,
            transactionsAdded: 0,
            transactionsModified: 0,
            transactionsRemoved: 0,
            errors: [],
        }

        try {
            this.log('info', `Syncing Stripe data from ${startDate.toISOString()} to ${endDate.toISOString()}`)

            const stripe = this.getClient()
            const stripeOptions = this.connectedAccountId
                ? { stripeAccount: this.connectedAccountId }
                : undefined

            // Sync charges (revenue)
            const chargesAdded = await this.syncCharges(stripe, startDate, endDate, stripeOptions)
            result.transactionsAdded += chargesAdded

            // Sync payouts
            const payoutsAdded = await this.syncPayouts(stripe, startDate, endDate, stripeOptions)
            result.transactionsAdded += payoutsAdded

            // Sync subscriptions for MRR calculation
            await this.syncSubscriptions(stripe, stripeOptions)

            // Update integration status
            await prisma.integration.update({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'STRIPE',
                    },
                },
                data: {
                    lastSyncAt: new Date(),
                },
            })

            result.success = true
            this.log('info', `Sync completed: ${result.transactionsAdded} transactions processed`)
        } catch (error: any) {
            this.log('error', 'Stripe sync failed', error)
            result.errors.push(error.message)
            throw new DataSyncError(this.name, error.message, result.transactionsAdded > 0, result.transactionsAdded)
        }

        return result
    }

    private async syncCharges(
        stripe: Stripe,
        startDate: Date,
        endDate: Date,
        stripeOptions?: Stripe.RequestOptions
    ): Promise<number> {
        let count = 0
        let hasMore = true
        let startingAfter: string | undefined

        while (hasMore) {
            const charges = await withRetry(() =>
                stripe.charges.list(
                    {
                        created: {
                            gte: Math.floor(startDate.getTime() / 1000),
                            lte: Math.floor(endDate.getTime() / 1000),
                        },
                        limit: 100,
                        starting_after: startingAfter,
                    },
                    stripeOptions
                )
            )

            for (const charge of charges.data) {
                if (charge.paid && !charge.refunded) {
                    await this.saveTransaction({
                        id: charge.id,
                        externalId: charge.id,
                        amount: charge.amount / 100, // Convert from cents
                        date: new Date(charge.created * 1000),
                        description: charge.description || `Payment from ${charge.billing_details.name || 'Customer'}`,
                        merchant: charge.billing_details.name || undefined,
                        category: 'revenue',
                        metadata: {
                            customerId: charge.customer,
                            paymentIntent: charge.payment_intent,
                            receiptUrl: charge.receipt_url,
                        },
                    })
                    count++
                }
            }

            hasMore = charges.has_more
            if (charges.data.length > 0) {
                startingAfter = charges.data[charges.data.length - 1].id
            }
        }

        return count
    }

    private async syncPayouts(
        stripe: Stripe,
        startDate: Date,
        endDate: Date,
        stripeOptions?: Stripe.RequestOptions
    ): Promise<number> {
        let count = 0
        let hasMore = true
        let startingAfter: string | undefined

        while (hasMore) {
            const payouts = await withRetry(() =>
                stripe.payouts.list(
                    {
                        created: {
                            gte: Math.floor(startDate.getTime() / 1000),
                            lte: Math.floor(endDate.getTime() / 1000),
                        },
                        limit: 100,
                        starting_after: startingAfter,
                    },
                    stripeOptions
                )
            )

            for (const payout of payouts.data) {
                if (payout.status === 'paid') {
                    await this.saveTransaction({
                        id: payout.id,
                        externalId: payout.id,
                        amount: payout.amount / 100 * -1, // Negative because money leaving Stripe
                        date: new Date((payout.arrival_date || payout.created) * 1000),
                        description: `Stripe Payout to bank`,
                        category: 'payout',
                        metadata: {
                            destination: payout.destination,
                            method: payout.method,
                        },
                    })
                    count++
                }
            }

            hasMore = payouts.has_more
            if (payouts.data.length > 0) {
                startingAfter = payouts.data[payouts.data.length - 1].id
            }
        }

        return count
    }

    private async syncSubscriptions(
        stripe: Stripe,
        stripeOptions?: Stripe.RequestOptions
    ): Promise<void> {
        let totalMRR = 0
        let activeSubscriptions = 0
        let hasMore = true
        let startingAfter: string | undefined

        while (hasMore) {
            const subscriptions = await withRetry(() =>
                stripe.subscriptions.list(
                    {
                        status: 'active',
                        limit: 100,
                        starting_after: startingAfter,
                    },
                    stripeOptions
                )
            )

            for (const sub of subscriptions.data) {
                for (const item of sub.items.data) {
                    if (item.price.recurring) {
                        let monthlyAmount = item.price.unit_amount || 0

                        // Normalize to monthly
                        if (item.price.recurring.interval === 'year') {
                            monthlyAmount = monthlyAmount / 12
                        } else if (item.price.recurring.interval === 'week') {
                            monthlyAmount = monthlyAmount * 4.33
                        }

                        totalMRR += (monthlyAmount / 100) * (item.quantity || 1)
                    }
                }
                activeSubscriptions++
            }

            hasMore = subscriptions.has_more
            if (subscriptions.data.length > 0) {
                startingAfter = subscriptions.data[subscriptions.data.length - 1].id
            }
        }

        // Store MRR in financial snapshot
        this.log('info', `Calculated MRR: $${totalMRR.toFixed(2)} from ${activeSubscriptions} subscriptions`)

        // Update or create financial snapshot with MRR
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await prisma.financialSnapshot.upsert({
            where: {
                companyId_date: {
                    companyId: this.companyId,
                    date: today,
                },
            },
            update: {
                mrr: Math.round(totalMRR),
            },
            create: {
                companyId: this.companyId,
                date: today,
                totalCash: 0,
                grossBurn: 0,
                netBurn: 0,
                runway: 0,
                mrr: Math.round(totalMRR),
            },
        })
    }

    async getAccounts(): Promise<Account[]> {
        try {
            const stripe = this.getClient()
            const balance = await stripe.balance.retrieve()

            const accounts: Account[] = []

            // Stripe balance by currency
            for (const available of balance.available) {
                accounts.push({
                    id: `stripe-${available.currency}`,
                    externalId: `stripe-balance-${available.currency}`,
                    name: `Stripe Balance (${available.currency.toUpperCase()})`,
                    type: 'other',
                    balance: available.amount / 100,
                    currency: available.currency.toUpperCase(),
                })
            }

            return accounts
        } catch (error: any) {
            this.log('error', 'Failed to get Stripe accounts', error)
            throw new DataSyncError(this.name, 'Failed to get accounts')
        }
    }

    async getAccountBalance(accountId: string): Promise<number> {
        try {
            const stripe = this.getClient()
            const balance = await stripe.balance.retrieve()

            const currency = accountId.replace('stripe-', '')
            const currencyBalance = balance.available.find((b) => b.currency === currency)

            return currencyBalance ? currencyBalance.amount / 100 : 0
        } catch (error: any) {
            this.log('error', 'Failed to get balance', error)
            throw new DataSyncError(this.name, 'Failed to get balance')
        }
    }

    async handleWebhook(event: WebhookEvent): Promise<void> {
        this.log('info', `Received Stripe webhook: ${event.type}`, event.payload)

        const stripeEvent = event.payload as Stripe.Event

        switch (stripeEvent.type) {
            case 'charge.succeeded': {
                const charge = stripeEvent.data.object as Stripe.Charge
                await this.saveTransaction({
                    id: charge.id,
                    externalId: charge.id,
                    amount: charge.amount / 100,
                    date: new Date(charge.created * 1000),
                    description: charge.description || 'Payment received',
                    category: 'revenue',
                })
                this.log('info', `Processed charge: ${charge.id}`)
                break
            }

            case 'charge.refunded': {
                const charge = stripeEvent.data.object as Stripe.Charge
                await this.saveTransaction({
                    id: `refund-${charge.id}`,
                    externalId: `refund-${charge.id}`,
                    amount: (charge.amount_refunded / 100) * -1,
                    date: new Date(),
                    description: `Refund for ${charge.id}`,
                    category: 'refund',
                })
                this.log('info', `Processed refund for charge: ${charge.id}`)
                break
            }

            case 'invoice.paid': {
                const invoice = stripeEvent.data.object as Stripe.Invoice
                this.log('info', `Invoice paid: ${invoice.id} - $${(invoice.amount_paid / 100).toFixed(2)}`)
                break
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                // Trigger MRR recalculation
                this.log('info', 'Subscription change detected, recalculating MRR')
                await this.syncSubscriptions(this.getClient())
                break
            }

            default:
                this.log('info', `Unhandled Stripe event: ${stripeEvent.type}`)
        }
    }

    async refreshAuth(): Promise<void> {
        // Stripe uses API keys, no refresh needed
        // Just verify the key is still valid
        try {
            const stripe = this.getClient()
            await stripe.account.retrieve()
        } catch {
            throw new AuthenticationError(this.name, true)
        }
    }

    async getStatus(): Promise<IntegrationStatus> {
        const integration = await prisma.integration.findUnique({
            where: {
                companyId_integrationType: {
                    companyId: this.companyId,
                    integrationType: 'STRIPE',
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
            where: {
                companyId: this.companyId,
                externalId: { startsWith: 'ch_' }, // Stripe charge IDs
            },
        })

        return {
            isConnected: integration.status === 'ACTIVE',
            lastSyncAt: integration.lastSyncAt || undefined,
            lastSyncStatus: integration.status === 'ACTIVE' ? 'success' : 'failed',
            syncedTransactions: transactionCount,
            accountsConnected: 1,
        }
    }

    // ==========================================
    // STRIPE-SPECIFIC METHODS
    // ==========================================
    async getMRR(): Promise<number> {
        const latestSnapshot = await prisma.financialSnapshot.findFirst({
            where: { companyId: this.companyId },
            orderBy: { date: 'desc' },
        })

        return latestSnapshot?.mrr || 0
    }

    async getRevenueMetrics(startDate: Date, endDate: Date): Promise<{
        totalRevenue: number
        chargeCount: number
        avgChargeAmount: number
        refunds: number
    }> {
        const transactions = await prisma.transaction.findMany({
            where: {
                companyId: this.companyId,
                externalId: { startsWith: 'ch_' },
                date: { gte: startDate, lte: endDate },
            },
        })

        const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0)
        const refunds = transactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)

        return {
            totalRevenue: totalRevenue - refunds,
            chargeCount: transactions.filter((tx) => tx.amount > 0).length,
            avgChargeAmount: transactions.length > 0 ? totalRevenue / transactions.length : 0,
            refunds: Math.abs(refunds),
        }
    }

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================
    private async saveTransaction(tx: Transaction): Promise<void> {
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
                    type: tx.amount > 0 ? 'income' : 'expense',
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
}
