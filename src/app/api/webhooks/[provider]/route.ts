import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
    IntegrationFactory,
    IntegrationType,
    INTEGRATION_CONFIG,
} from '@/lib/integrations'
import prisma from '@/lib/prisma'

// Webhook signature verification
function verifyPlaidSignature(body: string, signature: string): boolean {
    if (!process.env.PLAID_WEBHOOK_SECRET) return true // Skip if not configured

    const hmac = crypto.createHmac('sha256', process.env.PLAID_WEBHOOK_SECRET)
    hmac.update(body)
    const expectedSignature = hmac.digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

function verifyStripeSignature(body: string, signature: string): boolean {
    if (!process.env.STRIPE_WEBHOOK_SECRET) return true // Skip if not configured

    try {
        const Stripe = require('stripe')
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
        return true
    } catch {
        return false
    }
}

// POST /api/webhooks/[provider] - Unified webhook handler
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params
    const providerUpper = provider.toUpperCase() as IntegrationType

    // Validate provider
    if (!INTEGRATION_CONFIG[providerUpper]) {
        console.warn(`Unknown webhook provider: ${provider}`)
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    try {
        const body = await req.text()
        const signature = req.headers.get('x-webhook-signature') ||
            req.headers.get('plaid-verification') ||
            req.headers.get('stripe-signature') || ''

        // Verify signature based on provider
        let isValid = true
        switch (providerUpper) {
            case 'PLAID':
                isValid = verifyPlaidSignature(body, signature)
                break
            case 'STRIPE':
                isValid = verifyStripeSignature(body, signature)
                break
            // Add more providers as needed
        }

        if (!isValid) {
            console.warn(`Invalid webhook signature for ${provider}`)
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const payload = JSON.parse(body)

        // Log webhook for debugging
        console.log(`[Webhook][${provider}] Received:`, {
            type: payload.webhook_type || payload.type || 'unknown',
            timestamp: new Date().toISOString(),
        })

        // Find the company associated with this webhook
        let companyId: string | undefined

        switch (providerUpper) {
            case 'PLAID': {
                // Find integration by item_id
                const itemId = payload.item_id
                if (itemId) {
                    const integration = await prisma.integration.findFirst({
                        where: {
                            integrationType: 'PLAID',
                            config: { path: ['itemId'], equals: itemId },
                        },
                    })
                    companyId = integration?.companyId
                }
                break
            }

            case 'STRIPE': {
                // Stripe webhooks may include account ID for Connect
                const accountId = payload.account
                if (accountId) {
                    const integration = await prisma.integration.findFirst({
                        where: {
                            integrationType: 'STRIPE',
                            config: { path: ['connectedAccountId'], equals: accountId },
                        },
                    })
                    companyId = integration?.companyId
                } else {
                    // Use the first active Stripe integration (for platform account)
                    const integration = await prisma.integration.findFirst({
                        where: {
                            integrationType: 'STRIPE',
                            status: 'ACTIVE',
                        },
                    })
                    companyId = integration?.companyId
                }
                break
            }

            case 'SALESFORCE': {
                // Salesforce sends organization ID
                const orgId = payload.orgId || payload.organizationId
                if (orgId) {
                    const integration = await prisma.integration.findFirst({
                        where: {
                            integrationType: 'SALESFORCE',
                            config: { path: ['orgId'], equals: orgId },
                        },
                    })
                    companyId = integration?.companyId
                }
                break
            }
        }

        if (!companyId) {
            console.warn(`[Webhook][${provider}] No company found for webhook`)
            // Still return 200 to prevent retries
            return NextResponse.json({
                received: true,
                warning: 'No matching integration found',
            })
        }

        // Process webhook with the integration adapter
        try {
            const integration = await IntegrationFactory.create(providerUpper, companyId)
            await integration.handleWebhook({
                type: payload.webhook_type || payload.type || provider,
                timestamp: new Date(),
                payload,
                signature,
            })

            // Log successful webhook processing
            await prisma.webhookLog.create({
                data: {
                    companyId,
                    provider: providerUpper,
                    eventType: payload.webhook_type || payload.type || 'unknown',
                    payload: payload as any,
                    status: 'SUCCESS',
                    processedAt: new Date(),
                },
            }).catch(() => {
                // Ignore if webhookLog table doesn't exist
            })

            console.log(`[Webhook][${provider}] Processed successfully for company ${companyId}`)
        } catch (error: any) {
            console.error(`[Webhook][${provider}] Processing error:`, error.message)

            // Log failed webhook
            await prisma.webhookLog.create({
                data: {
                    companyId,
                    provider: providerUpper,
                    eventType: payload.webhook_type || payload.type || 'unknown',
                    payload: payload as any,
                    status: 'FAILED',
                    error: error.message,
                    processedAt: new Date(),
                },
            }).catch(() => {
                // Ignore if webhookLog table doesn't exist
            })

            // Still return 200 to prevent infinite retries
            return NextResponse.json({
                received: true,
                error: error.message,
            })
        }

        return NextResponse.json({ received: true, success: true })
    } catch (error: any) {
        console.error(`[Webhook][${provider}] Fatal error:`, error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

// GET /api/webhooks/[provider] - Return webhook info
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params

    return NextResponse.json({
        provider,
        status: 'active',
        endpoint: `${process.env.NEXT_PUBLIC_APP_URL || 'https://potent-fin.vercel.app'}/api/webhooks/${provider}`,
        supportedEvents: getProviderEvents(provider),
    })
}

function getProviderEvents(provider: string): string[] {
    switch (provider.toUpperCase()) {
        case 'PLAID':
            return [
                'TRANSACTIONS.SYNC_UPDATES_AVAILABLE',
                'ITEM.ERROR',
                'ITEM.PENDING_EXPIRATION',
            ]
        case 'STRIPE':
            return [
                'charge.succeeded',
                'charge.refunded',
                'invoice.paid',
                'customer.subscription.created',
                'customer.subscription.updated',
                'customer.subscription.deleted',
            ]
        case 'SALESFORCE':
            return [
                'Opportunity.create',
                'Opportunity.update',
            ]
        default:
            return []
    }
}
