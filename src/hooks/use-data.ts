import useSWR from 'swr'

// Generic fetcher function
const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'An error occurred')
    }
    return res.json()
}

// Dashboard data hook
export function useDashboard(companyId?: string) {
    const params = companyId ? `?companyId=${companyId}` : ''
    const { data, error, isLoading, mutate } = useSWR(
        `/api/dashboard${params}`,
        fetcher,
        {
            refreshInterval: 60000, // Refresh every minute
            revalidateOnFocus: true,
        }
    )

    return {
        data,
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Transactions hook
export function useTransactions(options?: {
    companyId?: string
    page?: number
    limit?: number
    category?: string
    search?: string
    type?: 'income' | 'expense' | 'all'
}) {
    const params = new URLSearchParams()
    if (options?.companyId) params.set('companyId', options.companyId)
    if (options?.page) params.set('page', options.page.toString())
    if (options?.limit) params.set('limit', options.limit.toString())
    if (options?.category) params.set('category', options.category)
    if (options?.search) params.set('search', options.search)
    if (options?.type) params.set('type', options.type)

    const queryString = params.toString()
    const { data, error, isLoading, mutate } = useSWR(
        `/api/transactions${queryString ? `?${queryString}` : ''}`,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        transactions: data?.transactions || [],
        pagination: data?.pagination,
        summary: data?.summary,
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Expenses hook
export function useExpenses(options?: {
    companyId?: string
    period?: '7d' | '30d' | '90d' | '12m'
    compare?: boolean
}) {
    const params = new URLSearchParams()
    if (options?.companyId) params.set('companyId', options.companyId)
    if (options?.period) params.set('period', options.period)
    if (options?.compare) params.set('compare', 'true')

    const queryString = params.toString()
    const { data, error, isLoading, mutate } = useSWR(
        `/api/expenses${queryString ? `?${queryString}` : ''}`,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        expensesByCategory: data?.expensesByCategory || [],
        summary: data?.summary,
        topVendors: data?.topVendors || [],
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Forecasts hook
export function useForecasts(options?: {
    companyId?: string
    months?: number
    scenario?: 'base' | 'optimistic' | 'pessimistic'
}) {
    const params = new URLSearchParams()
    if (options?.companyId) params.set('companyId', options.companyId)
    if (options?.months) params.set('months', options.months.toString())
    if (options?.scenario) params.set('scenario', options.scenario)

    const queryString = params.toString()
    const { data, error, isLoading, mutate } = useSWR(
        `/api/forecasts${queryString ? `?${queryString}` : ''}`,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        ...data,
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Accounts hook
export function useAccounts(companyId?: string) {
    const params = companyId ? `?companyId=${companyId}` : ''
    const { data, error, isLoading, mutate } = useSWR(
        `/api/accounts${params}`,
        fetcher,
        { revalidateOnFocus: true }
    )

    return {
        accounts: data?.accounts || [],
        summary: data?.summary,
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Alerts hook
export function useAlerts(options?: {
    companyId?: string
    filter?: 'all' | 'unread' | 'critical' | 'warning' | 'info' | 'success'
    limit?: number
}) {
    const params = new URLSearchParams()
    if (options?.companyId) params.set('companyId', options.companyId)
    if (options?.filter) params.set('filter', options.filter)
    if (options?.limit) params.set('limit', options.limit.toString())

    const queryString = params.toString()
    const { data, error, isLoading, mutate } = useSWR(
        `/api/alerts${queryString ? `?${queryString}` : ''}`,
        fetcher,
        {
            refreshInterval: 30000, // Check for new alerts every 30s
            revalidateOnFocus: true,
        }
    )

    return {
        alerts: data?.alerts || [],
        summary: data?.summary,
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Categories hook
export function useCategories(companyId?: string, type?: string) {
    const params = new URLSearchParams()
    if (companyId) params.set('companyId', companyId)
    if (type) params.set('type', type)

    const queryString = params.toString()
    const { data, error, isLoading, mutate } = useSWR(
        `/api/categories${queryString ? `?${queryString}` : ''}`,
        fetcher,
        { revalidateOnFocus: false }
    )

    return {
        categories: data?.categories || [],
        isLoading,
        isError: error,
        refresh: mutate,
    }
}

// Sync accounts hook
export function useSyncAccounts() {
    const sync = async (companyId: string, accountId?: string) => {
        const res = await fetch('/api/plaid/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, accountId }),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Sync failed')
        }

        return res.json()
    }

    return { sync }
}
