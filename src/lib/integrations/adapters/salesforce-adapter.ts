/**
 * FinYeld AI - Salesforce Integration Adapter
 * Implements FinancialIntegration interface for Salesforce CRM data
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
    exchangeCodeForToken,
    refreshSalesforceToken,
    storeSalesforceCredentials,
} from '@/lib/salesforce-auth'
import prisma from '@/lib/prisma'

interface SalesforceOpportunity {
    Id: string
    Name: string
    Amount: number
    StageName: string
    CloseDate: string
    Probability: number
    CreatedDate: string
    LastModifiedDate: string
    AccountName?: string
    OwnerId?: string
    IsClosed: boolean
    IsWon: boolean
}

interface SalesforcePipelineMetrics {
    totalPipelineValue: number
    weightedPipelineValue: number
    opportunityCount: number
    averageDealSize: number
    stageBreakdown: Record<string, { count: number; value: number }>
    closingThisMonth: number
    closingThisQuarter: number
}

export class SalesforceIntegration extends BaseIntegration {
    readonly name = 'Salesforce'
    readonly tier = 2 as const

    private instanceUrl?: string

    constructor(companyId: string) {
        super(companyId)
    }

    async connect(credentials: IntegrationCredentials): Promise<void> {
        try {
            this.log('info', 'Connecting to Salesforce...')

            // Exchange authorization code for tokens
            const tokens = await exchangeCodeForToken(credentials.metadata?.code as string)

            this.accessToken = tokens.access_token
            this.refreshToken = tokens.refresh_token
            this.instanceUrl = tokens.instance_url

            // Store credentials
            await storeSalesforceCredentials(this.companyId, tokens)

            this.log('info', `Connected to Salesforce instance: ${this.instanceUrl}`)
        } catch (error: any) {
            this.log('error', 'Failed to connect to Salesforce', error)
            throw new AuthenticationError(this.name, true)
        }
    }

    async disconnect(): Promise<void> {
        try {
            await prisma.integration.update({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'SALESFORCE',
                    },
                },
                data: {
                    status: 'INACTIVE',
                    accessToken: null,
                    refreshToken: null,
                },
            })

            this.accessToken = undefined
            this.refreshToken = undefined
            this.instanceUrl = undefined

            this.log('info', 'Disconnected from Salesforce')
        } catch (error) {
            this.log('error', 'Failed to disconnect from Salesforce', error)
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
            this.log('info', `Syncing Salesforce opportunities from ${startDate.toISOString()} to ${endDate.toISOString()}`)

            // Query closed-won opportunities as "revenue"
            const opportunities = await this.queryOpportunities(startDate, endDate)

            for (const opp of opportunities) {
                if (opp.IsClosed && opp.IsWon && opp.Amount) {
                    await this.saveTransaction({
                        id: opp.Id,
                        externalId: `sf-${opp.Id}`,
                        amount: opp.Amount,
                        date: new Date(opp.CloseDate),
                        description: `Deal Won: ${opp.Name}`,
                        category: 'sales-revenue',
                        metadata: {
                            stage: opp.StageName,
                            probability: opp.Probability,
                            accountName: opp.AccountName,
                        },
                    })
                    result.transactionsAdded++
                }
            }

            // Calculate pipeline metrics
            await this.updatePipelineMetrics()

            // Update integration status
            await prisma.integration.update({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'SALESFORCE',
                    },
                },
                data: {
                    lastSyncAt: new Date(),
                },
            })

            result.success = true
            this.log('info', `Sync completed: ${result.transactionsAdded} deals synced`)
        } catch (error: any) {
            this.log('error', 'Salesforce sync failed', error)
            result.errors.push(error.message)

            if (error.statusCode === 401) {
                throw new AuthenticationError(this.name, true)
            }
            if (error.statusCode === 429) {
                throw new RateLimitError(this.name, 60)
            }

            throw new DataSyncError(this.name, error.message, result.transactionsAdded > 0, result.transactionsAdded)
        }

        return result
    }

    async getAccounts(): Promise<Account[]> {
        // Salesforce doesn't have "accounts" in the financial sense
        // Return pipeline as a virtual account
        const metrics = await this.getPipelineMetrics()

        return [
            {
                id: 'salesforce-pipeline',
                externalId: 'sf-pipeline',
                name: 'Sales Pipeline',
                type: 'other',
                balance: metrics.weightedPipelineValue,
                currency: 'USD',
            },
        ]
    }

    async getAccountBalance(accountId: string): Promise<number> {
        if (accountId === 'salesforce-pipeline') {
            const metrics = await this.getPipelineMetrics()
            return metrics.weightedPipelineValue
        }
        return 0
    }

    async handleWebhook(event: WebhookEvent): Promise<void> {
        this.log('info', `Received Salesforce webhook: ${event.type}`, event.payload)

        const payload = event.payload as {
            sobject: string
            type: string
            record: SalesforceOpportunity
        }

        if (payload.sobject === 'Opportunity') {
            const opp = payload.record

            if (opp.IsClosed && opp.IsWon && opp.Amount) {
                await this.saveTransaction({
                    id: opp.Id,
                    externalId: `sf-${opp.Id}`,
                    amount: opp.Amount,
                    date: new Date(opp.CloseDate),
                    description: `Deal Won: ${opp.Name}`,
                    category: 'sales-revenue',
                })
                this.log('info', `Processed closed-won deal: ${opp.Name}`)
            }

            // Recalculate pipeline
            await this.updatePipelineMetrics()
        }
    }

    async refreshAuth(): Promise<void> {
        try {
            await this.ensureConnected()

            if (this.refreshToken) {
                const tokens = await refreshSalesforceToken(this.refreshToken)

                this.accessToken = tokens.access_token
                if (tokens.refresh_token) {
                    this.refreshToken = tokens.refresh_token
                }

                await prisma.integration.update({
                    where: {
                        companyId_integrationType: {
                            companyId: this.companyId,
                            integrationType: 'SALESFORCE',
                        },
                    },
                    data: {
                        accessToken: this.accessToken,
                        refreshToken: this.refreshToken,
                        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
                    },
                })

                this.log('info', 'Salesforce token refreshed')
            }
        } catch (error) {
            this.log('error', 'Failed to refresh Salesforce token', error)
            throw new AuthenticationError(this.name, true)
        }
    }

    async getStatus(): Promise<IntegrationStatus> {
        const integration = await prisma.integration.findUnique({
            where: {
                companyId_integrationType: {
                    companyId: this.companyId,
                    integrationType: 'SALESFORCE',
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

        const dealCount = await prisma.transaction.count({
            where: {
                companyId: this.companyId,
                externalId: { startsWith: 'sf-' },
            },
        })

        return {
            isConnected: integration.status === 'ACTIVE',
            lastSyncAt: integration.lastSyncAt || undefined,
            lastSyncStatus: integration.status === 'ACTIVE' ? 'success' : 'failed',
            syncedTransactions: dealCount,
            accountsConnected: 1,
        }
    }

    // ==========================================
    // SALESFORCE-SPECIFIC METHODS
    // ==========================================
    async getPipelineMetrics(): Promise<SalesforcePipelineMetrics> {
        await this.ensureConnected()

        try {
            const opportunities = await this.queryOpenOpportunities()

            const now = new Date()
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            const endOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)

            const stageBreakdown: Record<string, { count: number; value: number }> = {}
            let totalPipelineValue = 0
            let weightedPipelineValue = 0
            let closingThisMonth = 0
            let closingThisQuarter = 0

            for (const opp of opportunities) {
                const amount = opp.Amount || 0
                totalPipelineValue += amount
                weightedPipelineValue += amount * (opp.Probability / 100)

                // Stage breakdown
                if (!stageBreakdown[opp.StageName]) {
                    stageBreakdown[opp.StageName] = { count: 0, value: 0 }
                }
                stageBreakdown[opp.StageName].count++
                stageBreakdown[opp.StageName].value += amount

                // Closing timeline
                const closeDate = new Date(opp.CloseDate)
                if (closeDate <= endOfMonth) {
                    closingThisMonth += amount
                }
                if (closeDate <= endOfQuarter) {
                    closingThisQuarter += amount
                }
            }

            return {
                totalPipelineValue,
                weightedPipelineValue,
                opportunityCount: opportunities.length,
                averageDealSize: opportunities.length > 0 ? totalPipelineValue / opportunities.length : 0,
                stageBreakdown,
                closingThisMonth,
                closingThisQuarter,
            }
        } catch (error: any) {
            this.log('error', 'Failed to get pipeline metrics', error)
            throw new DataSyncError(this.name, 'Failed to get pipeline metrics')
        }
    }

    // ==========================================
    // PRIVATE HELPERS
    // ==========================================
    private async ensureConnected(): Promise<void> {
        if (!this.accessToken || !this.instanceUrl) {
            const integration = await prisma.integration.findUnique({
                where: {
                    companyId_integrationType: {
                        companyId: this.companyId,
                        integrationType: 'SALESFORCE',
                    },
                },
            })

            if (!integration?.accessToken) {
                throw new AuthenticationError(this.name, true)
            }

            this.accessToken = integration.accessToken
            this.refreshToken = integration.refreshToken || undefined
            const config = integration.config as { instanceUrl?: string } | null
            this.instanceUrl = config?.instanceUrl

            // Check if token needs refresh
            if (integration.tokenExpiresAt && new Date() > integration.tokenExpiresAt) {
                await this.refreshAuth()
            }
        }
    }

    private async queryOpportunities(startDate: Date, endDate: Date): Promise<SalesforceOpportunity[]> {
        const query = `
      SELECT Id, Name, Amount, StageName, CloseDate, Probability, 
             CreatedDate, LastModifiedDate, IsClosed, IsWon,
             Account.Name
      FROM Opportunity
      WHERE CloseDate >= ${startDate.toISOString().split('T')[0]}
        AND CloseDate <= ${endDate.toISOString().split('T')[0]}
      ORDER BY CloseDate DESC
    `

        return this.executeSoql<SalesforceOpportunity>(query)
    }

    private async queryOpenOpportunities(): Promise<SalesforceOpportunity[]> {
        const query = `
      SELECT Id, Name, Amount, StageName, CloseDate, Probability,
             IsClosed, IsWon
      FROM Opportunity
      WHERE IsClosed = false
      ORDER BY Amount DESC
    `

        return this.executeSoql<SalesforceOpportunity>(query)
    }

    private async executeSoql<T>(query: string): Promise<T[]> {
        const response = await withRetry(async () => {
            const res = await fetch(
                `${this.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (res.status === 401) {
                await this.refreshAuth()
                throw new AuthenticationError(this.name, false)
            }

            if (res.status === 429) {
                throw new RateLimitError(this.name, 60)
            }

            if (!res.ok) {
                throw new Error(`Salesforce API error: ${res.status}`)
            }

            return res.json()
        })

        return response.records as T[]
    }

    private async updatePipelineMetrics(): Promise<void> {
        const metrics = await this.getPipelineMetrics()

        // Store pipeline metrics (could be saved to a dedicated table or snapshot)
        this.log('info', `Pipeline: $${metrics.totalPipelineValue.toLocaleString()} total, $${metrics.weightedPipelineValue.toLocaleString()} weighted`)
    }

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
                    type: 'income',
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
