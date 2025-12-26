/**
 * HubSpot CRM Integration Service
 * Handles OAuth, deals, contacts, and revenue data from HubSpot
 */

const HUBSPOT_API_BASE = 'https://api.hubapi.com'

export interface HubSpotConfig {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface HubSpotDeal {
  id: string
  name: string
  amount: number
  stage: string
  closeDate: string
  probability: number
  ownerName?: string
  companyName?: string
}

export interface HubSpotContact {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  lifecycleStage: string
}

export interface HubSpotPipeline {
  id: string
  name: string
  stages: {
    id: string
    name: string
    probability: number
  }[]
}

export interface HubSpotRevenueData {
  totalDeals: number
  totalValue: number
  wonDeals: number
  wonValue: number
  pipeline: {
    stage: string
    count: number
    value: number
  }[]
  recentDeals: HubSpotDeal[]
}

class HubSpotClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${HUBSPOT_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`HubSpot API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  async getDeals(limit = 100): Promise<HubSpotDeal[]> {
    const data = await this.request<{
      results: Array<{
        id: string
        properties: {
          dealname: string
          amount: string
          dealstage: string
          closedate: string
          hs_deal_stage_probability: string
        }
      }>
    }>(
      `/crm/v3/objects/deals?limit=${limit}&properties=dealname,amount,dealstage,closedate,hs_deal_stage_probability`
    )

    return data.results.map((deal) => ({
      id: deal.id,
      name: deal.properties.dealname || 'Unnamed Deal',
      amount: parseFloat(deal.properties.amount) || 0,
      stage: deal.properties.dealstage || 'unknown',
      closeDate: deal.properties.closedate || '',
      probability: parseFloat(deal.properties.hs_deal_stage_probability) || 0,
    }))
  }

  async getContacts(limit = 100): Promise<HubSpotContact[]> {
    const data = await this.request<{
      results: Array<{
        id: string
        properties: {
          email: string
          firstname: string
          lastname: string
          company: string
          lifecyclestage: string
        }
      }>
    }>(
      `/crm/v3/objects/contacts?limit=${limit}&properties=email,firstname,lastname,company,lifecyclestage`
    )

    return data.results.map((contact) => ({
      id: contact.id,
      email: contact.properties.email || '',
      firstName: contact.properties.firstname || '',
      lastName: contact.properties.lastname || '',
      company: contact.properties.company,
      lifecycleStage: contact.properties.lifecyclestage || 'subscriber',
    }))
  }

  async getPipelines(): Promise<HubSpotPipeline[]> {
    const data = await this.request<{
      results: Array<{
        id: string
        label: string
        stages: Array<{
          id: string
          label: string
          metadata: { probability: string }
        }>
      }>
    }>('/crm/v3/pipelines/deals')

    return data.results.map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.label,
      stages: pipeline.stages.map((stage) => ({
        id: stage.id,
        name: stage.label,
        probability: parseFloat(stage.metadata?.probability) || 0,
      })),
    }))
  }

  async getRevenueData(): Promise<HubSpotRevenueData> {
    const deals = await this.getDeals(200)

    const wonDeals = deals.filter((d) => d.stage === 'closedwon')
    const pipelineMap = new Map<string, { count: number; value: number }>()

    deals.forEach((deal) => {
      const existing = pipelineMap.get(deal.stage) || { count: 0, value: 0 }
      pipelineMap.set(deal.stage, {
        count: existing.count + 1,
        value: existing.value + deal.amount,
      })
    })

    return {
      totalDeals: deals.length,
      totalValue: deals.reduce((sum, d) => sum + d.amount, 0),
      wonDeals: wonDeals.length,
      wonValue: wonDeals.reduce((sum, d) => sum + d.amount, 0),
      pipeline: Array.from(pipelineMap.entries()).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
      })),
      recentDeals: deals.slice(0, 10),
    }
  }
}

// OAuth helpers
export function getHubSpotAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const scopes = ['crm.objects.deals.read', 'crm.objects.contacts.read', 'crm.schemas.deals.read']
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state,
  })
  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`
}

export async function exchangeHubSpotCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange HubSpot authorization code')
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

export async function refreshHubSpotToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh HubSpot token')
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

export function createHubSpotClient(accessToken: string): HubSpotClient {
  return new HubSpotClient(accessToken)
}

// Demo data for development
export function getDemoHubSpotData(): HubSpotRevenueData {
  return {
    totalDeals: 47,
    totalValue: 2850000,
    wonDeals: 23,
    wonValue: 1420000,
    pipeline: [
      { stage: 'Qualified', count: 12, value: 480000 },
      { stage: 'Proposal', count: 8, value: 560000 },
      { stage: 'Negotiation', count: 4, value: 390000 },
      { stage: 'Closed Won', count: 23, value: 1420000 },
    ],
    recentDeals: [
      {
        id: '1',
        name: 'Acme Corp Enterprise',
        amount: 120000,
        stage: 'Negotiation',
        closeDate: '2025-01-15',
        probability: 75,
      },
      {
        id: '2',
        name: 'TechStart Pro Plan',
        amount: 48000,
        stage: 'Proposal',
        closeDate: '2025-01-20',
        probability: 50,
      },
      {
        id: '3',
        name: 'GlobalCo Annual',
        amount: 250000,
        stage: 'Qualified',
        closeDate: '2025-02-01',
        probability: 25,
      },
      {
        id: '4',
        name: 'StartupXYZ Growth',
        amount: 36000,
        stage: 'Closed Won',
        closeDate: '2024-12-20',
        probability: 100,
      },
      {
        id: '5',
        name: 'Enterprise Ltd',
        amount: 85000,
        stage: 'Proposal',
        closeDate: '2025-01-25',
        probability: 50,
      },
    ],
  }
}
