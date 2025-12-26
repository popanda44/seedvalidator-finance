import { prisma } from "@/lib/prisma"

const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID
const SALESFORCE_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET
const SALESFORCE_URL = process.env.SALESFORCE_URL || "https://login.salesforce.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "https://potent-fin.vercel.app"

if (!SALESFORCE_CLIENT_ID || !SALESFORCE_CLIENT_SECRET) {
  console.warn("Salesforce credentials are not set")
}

export const SALESFORCE_CONFIG = {
  clientId: SALESFORCE_CLIENT_ID,
  clientSecret: SALESFORCE_CLIENT_SECRET,
  authUrl: `${SALESFORCE_URL}/services/oauth2/authorize`,
  tokenUrl: `${SALESFORCE_URL}/services/oauth2/token`,
  redirectUri: `${APP_URL}/api/integrations/salesforce/callback`,
  scopes: ["api", "refresh_token", "offline_access"],
}

export async function getSalesforceAuthUrl(companyId: string, redirectUri?: string) {
  const finalRedirectUri = redirectUri || SALESFORCE_CONFIG.redirectUri

  const params = new URLSearchParams({
    response_type: "code",
    client_id: SALESFORCE_CONFIG.clientId!,
    redirect_uri: finalRedirectUri,
    scope: SALESFORCE_CONFIG.scopes.join(" "),
    state: companyId, // Pass companyId as state to identify user on callback
  })

  return `${SALESFORCE_CONFIG.authUrl}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string, redirectUri?: string) {
  const finalRedirectUri = redirectUri || SALESFORCE_CONFIG.redirectUri

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: SALESFORCE_CONFIG.clientId!,
    client_secret: SALESFORCE_CONFIG.clientSecret!,
    redirect_uri: finalRedirectUri,
    code,
  })

  const response = await fetch(SALESFORCE_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || "Failed to exchange code for token")
  }

  return response.json()
}

export async function refreshSalesforceToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: SALESFORCE_CONFIG.clientId!,
    client_secret: SALESFORCE_CONFIG.clientSecret!,
    refresh_token: refreshToken,
  })

  const response = await fetch(SALESFORCE_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh token")
  }

  return response.json()
}

export async function storeSalesforceCredentials(
  companyId: string,
  tokens: {
    access_token: string
    refresh_token: string
    instance_url: string
    issued_at: string
  }
) {
  // Calculate expiry (Session timeout is usually 2 hours, but we rely on refresh token)
  // We'll set a safe expiry of 1 hour for the access token
  const expiresAt = new Date(Date.now() + 3600 * 1000)

  await prisma.integration.upsert({
    where: {
      companyId_integrationType: {
        companyId,
        integrationType: "SALESFORCE",
      },
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: expiresAt,
      status: "ACTIVE",
      config: {
        instanceUrl: tokens.instance_url,
      },
      lastSyncAt: new Date(),
    },
    create: {
      companyId,
      integrationType: "SALESFORCE",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: expiresAt,
      status: "ACTIVE",
      config: {
        instanceUrl: tokens.instance_url,
      },
      lastSyncAt: new Date(),
    },
  })
}
