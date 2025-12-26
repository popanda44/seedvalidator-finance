/**
 * FinYeld AI - Unified Integration Architecture
 * Adapter Pattern implementation for financial data sources
 */

// ==========================================
// CORE TYPES
// ==========================================
export interface Transaction {
    id: string
    externalId?: string
    amount: number
    date: Date
    description: string
    merchant?: string
    category: string
    accountId?: string
    pending?: boolean
    metadata?: Record<string, unknown>
}

export interface Account {
    id: string
    externalId: string
    name: string
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'other'
    subtype?: string
    balance: number
    availableBalance?: number
    currency: string
    institutionId?: string
    institutionName?: string
    lastSyncAt?: Date
}

export interface SyncResult {
    success: boolean
    transactionsAdded: number
    transactionsModified: number
    transactionsRemoved: number
    errors: string[]
    cursor?: string
    hasMore?: boolean
}

export interface WebhookEvent {
    type: string
    timestamp: Date
    payload: Record<string, unknown>
    signature?: string
}

export interface IntegrationCredentials {
    accessToken?: string
    refreshToken?: string
    publicToken?: string
    apiKey?: string
    clientId?: string
    clientSecret?: string
    instanceUrl?: string
    expiresAt?: Date
    metadata?: Record<string, unknown>
}

export interface IntegrationStatus {
    isConnected: boolean
    lastSyncAt?: Date
    lastSyncStatus: 'success' | 'partial' | 'failed' | 'pending'
    errorMessage?: string
    syncedTransactions: number
    accountsConnected: number
}

// ==========================================
// ERROR CLASSES
// ==========================================
export class IntegrationError extends Error {
    constructor(
        message: string,
        public code: string,
        public integrationName: string,
        public retryable: boolean = false
    ) {
        super(message)
        this.name = 'IntegrationError'
    }
}

export class RateLimitError extends IntegrationError {
    constructor(
        integrationName: string,
        public retryAfter: number = 60 // seconds
    ) {
        super(
            `Rate limit exceeded for ${integrationName}. Retry after ${retryAfter}s`,
            'RATE_LIMIT',
            integrationName,
            true
        )
        this.name = 'RateLimitError'
    }
}

export class AuthenticationError extends IntegrationError {
    constructor(
        integrationName: string,
        public requiresReconnect: boolean = true
    ) {
        super(
            `Authentication failed for ${integrationName}. ${requiresReconnect ? 'Please reconnect.' : ''}`,
            'AUTH_ERROR',
            integrationName,
            false
        )
        this.name = 'AuthenticationError'
    }
}

export class DataSyncError extends IntegrationError {
    constructor(
        integrationName: string,
        message: string,
        public partialSuccess: boolean = false,
        public syncedCount: number = 0
    ) {
        super(message, 'SYNC_ERROR', integrationName, true)
        this.name = 'DataSyncError'
    }
}

export class ConfigurationError extends IntegrationError {
    constructor(integrationName: string, message: string) {
        super(message, 'CONFIG_ERROR', integrationName, false)
        this.name = 'ConfigurationError'
    }
}

// ==========================================
// INTEGRATION INTERFACE (Adapter Pattern)
// ==========================================
export interface FinancialIntegration {
    readonly name: string
    readonly tier: 1 | 2 | 3

    // Connection management
    connect(credentials: IntegrationCredentials): Promise<void>
    disconnect(): Promise<void>
    isConnected(): Promise<boolean>
    refreshAuth(): Promise<void>

    // Data operations
    syncTransactions(startDate: Date, endDate: Date): Promise<SyncResult>
    getAccounts(): Promise<Account[]>
    getAccountBalance(accountId: string): Promise<number>

    // Webhook handling
    handleWebhook(event: WebhookEvent): Promise<void>

    // Status
    getStatus(): Promise<IntegrationStatus>
}

// ==========================================
// BASE INTEGRATION (Abstract Class)
// ==========================================
export abstract class BaseIntegration implements FinancialIntegration {
    abstract readonly name: string
    abstract readonly tier: 1 | 2 | 3

    protected companyId: string
    protected accessToken?: string
    protected refreshToken?: string
    protected tokenExpiresAt?: Date

    constructor(companyId: string) {
        this.companyId = companyId
    }

    abstract connect(credentials: IntegrationCredentials): Promise<void>
    abstract disconnect(): Promise<void>
    abstract syncTransactions(startDate: Date, endDate: Date): Promise<SyncResult>
    abstract getAccounts(): Promise<Account[]>
    abstract getAccountBalance(accountId: string): Promise<number>
    abstract handleWebhook(event: WebhookEvent): Promise<void>
    abstract refreshAuth(): Promise<void>

    async isConnected(): Promise<boolean> {
        return !!this.accessToken
    }

    abstract getStatus(): Promise<IntegrationStatus>

    // Helper: Check if token needs refresh
    protected needsTokenRefresh(): boolean {
        if (!this.tokenExpiresAt) return false
        const bufferTime = 5 * 60 * 1000 // 5 minutes buffer
        return new Date().getTime() > this.tokenExpiresAt.getTime() - bufferTime
    }

    // Helper: Log integration activity
    protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
        const prefix = `[${this.name}][${this.companyId}]`
        const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
        logFn(`${prefix} ${message}`, data || '')
    }
}

// ==========================================
// RETRY UTILITY WITH EXPONENTIAL BACKOFF
// ==========================================
export interface RetryOptions {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    onRetry?: (attempt: number, error: Error) => void
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 30000, onRetry } = options

    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            // Don't retry non-retryable errors
            if (error instanceof IntegrationError && !error.retryable) {
                throw error
            }

            // Handle rate limits specially
            if (error instanceof RateLimitError) {
                const delay = Math.min(error.retryAfter * 1000, maxDelayMs)
                onRetry?.(attempt + 1, lastError)
                await sleep(delay)
                continue
            }

            // Exponential backoff for other errors
            if (attempt < maxRetries - 1) {
                const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
                onRetry?.(attempt + 1, lastError)
                await sleep(delay)
            }
        }
    }

    throw lastError || new Error('Max retries exceeded')
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==========================================
// INTEGRATION REGISTRY
// ==========================================
export type IntegrationType =
    | 'PLAID'
    | 'STRIPE'
    | 'QUICKBOOKS'
    | 'SALESFORCE'
    | 'GUSTO'
    | 'HUBSPOT'
    | 'XERO'
    | 'BREX'
    | 'RAMP'
    | 'AWS'
    | 'GCP'
    | 'NETSUITE'

export const INTEGRATION_CONFIG: Record<
    IntegrationType,
    {
        name: string
        tier: 1 | 2 | 3
        syncFrequency: string
        description: string
    }
> = {
    PLAID: {
        name: 'Plaid',
        tier: 1,
        syncFrequency: 'Daily at 2 AM',
        description: 'Banking transactions and balances',
    },
    STRIPE: {
        name: 'Stripe',
        tier: 1,
        syncFrequency: 'Real-time webhooks',
        description: 'Revenue, subscriptions, and MRR',
    },
    QUICKBOOKS: {
        name: 'QuickBooks Online',
        tier: 2,
        syncFrequency: 'Nightly at 3 AM',
        description: 'P&L, balance sheet, expenses',
    },
    SALESFORCE: {
        name: 'Salesforce',
        tier: 2,
        syncFrequency: 'Every 6 hours',
        description: 'Sales pipeline and opportunities',
    },
    GUSTO: {
        name: 'Gusto',
        tier: 2,
        syncFrequency: 'After each payroll run',
        description: 'Employee costs and payroll',
    },
    HUBSPOT: {
        name: 'HubSpot',
        tier: 3,
        syncFrequency: 'Every 6 hours',
        description: 'Marketing CRM and contacts',
    },
    XERO: {
        name: 'Xero',
        tier: 3,
        syncFrequency: 'Nightly',
        description: 'Accounting alternative',
    },
    BREX: {
        name: 'Brex',
        tier: 3,
        syncFrequency: 'Real-time webhooks',
        description: 'Corporate card spend',
    },
    RAMP: {
        name: 'Ramp',
        tier: 3,
        syncFrequency: 'Real-time webhooks',
        description: 'Corporate card spend',
    },
    AWS: {
        name: 'AWS Cost Explorer',
        tier: 3,
        syncFrequency: 'Daily',
        description: 'Cloud infrastructure costs',
    },
    GCP: {
        name: 'Google Cloud Billing',
        tier: 3,
        syncFrequency: 'Daily',
        description: 'Cloud infrastructure costs',
    },
    NETSUITE: {
        name: 'NetSuite',
        tier: 3,
        syncFrequency: 'Nightly',
        description: 'Enterprise ERP',
    },
}

// ==========================================
// INTEGRATION FACTORY
// ==========================================
export class IntegrationFactory {
    private static instances: Map<string, FinancialIntegration> = new Map()

    static async create(
        type: IntegrationType,
        companyId: string
    ): Promise<FinancialIntegration> {
        const key = `${type}-${companyId}`

        if (this.instances.has(key)) {
            return this.instances.get(key)!
        }

        let integration: FinancialIntegration

        switch (type) {
            case 'PLAID':
                const { PlaidIntegration } = await import('./adapters/plaid-adapter')
                integration = new PlaidIntegration(companyId)
                break
            case 'STRIPE':
                const { StripeIntegration } = await import('./adapters/stripe-adapter')
                integration = new StripeIntegration(companyId)
                break
            case 'SALESFORCE':
                const { SalesforceIntegration } = await import('./adapters/salesforce-adapter')
                integration = new SalesforceIntegration(companyId)
                break
            default:
                throw new ConfigurationError(type, `Integration ${type} not implemented yet`)
        }

        this.instances.set(key, integration)
        return integration
    }

    static clearInstance(type: IntegrationType, companyId: string): void {
        const key = `${type}-${companyId}`
        this.instances.delete(key)
    }
}

// ==========================================
// SYNC SCHEDULER TYPES
// ==========================================
export interface SyncJob {
    integrationId: string
    companyId: string
    integrationType: IntegrationType
    scheduledAt: Date
    status: 'pending' | 'running' | 'completed' | 'failed'
    startedAt?: Date
    completedAt?: Date
    result?: SyncResult
    error?: string
    attempts: number
}

export interface SyncSchedule {
    integrationType: IntegrationType
    cronExpression: string
    timeout: number // minutes
    enabled: boolean
}

export const DEFAULT_SYNC_SCHEDULES: SyncSchedule[] = [
    { integrationType: 'PLAID', cronExpression: '0 2 * * *', timeout: 30, enabled: true },
    { integrationType: 'STRIPE', cronExpression: '*/15 * * * *', timeout: 5, enabled: true },
    { integrationType: 'SALESFORCE', cronExpression: '0 */6 * * *', timeout: 15, enabled: true },
    { integrationType: 'QUICKBOOKS', cronExpression: '0 3 * * *', timeout: 45, enabled: true },
]
