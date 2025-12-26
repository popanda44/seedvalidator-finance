import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
    IntegrationFactory,
    IntegrationType,
    INTEGRATION_CONFIG,
    IntegrationError,
} from '@/lib/integrations'
import prisma from '@/lib/prisma'

// GET /api/integrations/status - Get all integration statuses
export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's company
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true },
        })

        if (!user?.companyId) {
            return NextResponse.json({ error: 'No company associated' }, { status: 400 })
        }

        // Get all integrations for the company
        const integrations = await prisma.integration.findMany({
            where: { companyId: user.companyId },
        })

        // Build status for all possible integrations
        const statuses = Object.entries(INTEGRATION_CONFIG).map(([type, config]) => {
            const integration = integrations.find((i) => i.integrationType === type)

            return {
                type,
                name: config.name,
                tier: config.tier,
                description: config.description,
                syncFrequency: config.syncFrequency,
                status: {
                    isConnected: integration?.status === 'ACTIVE',
                    lastSyncAt: integration?.lastSyncAt || null,
                    lastSyncStatus: integration?.status || 'not_connected',
                    errorMessage: integration?.status === 'ERROR' ? 'Reconnection required' : null,
                },
            }
        })

        // Sort by tier (1 first) and connection status
        statuses.sort((a, b) => {
            if (a.tier !== b.tier) return a.tier - b.tier
            if (a.status.isConnected !== b.status.isConnected) {
                return a.status.isConnected ? -1 : 1
            }
            return 0
        })

        return NextResponse.json({
            success: true,
            integrations: statuses,
            summary: {
                totalAvailable: statuses.length,
                connected: statuses.filter((s) => s.status.isConnected).length,
                tier1Connected: statuses.filter((s) => s.tier === 1 && s.status.isConnected).length,
            },
        })
    } catch (error: any) {
        console.error('Integration status error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to get integration status' },
            { status: 500 }
        )
    }
}

// POST /api/integrations/status - Sync a specific integration
export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { integrationType, action } = body

        if (!integrationType || !INTEGRATION_CONFIG[integrationType as IntegrationType]) {
            return NextResponse.json(
                { error: 'Invalid integration type' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true },
        })

        if (!user?.companyId) {
            return NextResponse.json({ error: 'No company associated' }, { status: 400 })
        }

        try {
            const integration = await IntegrationFactory.create(
                integrationType as IntegrationType,
                user.companyId
            )

            switch (action) {
                case 'sync': {
                    // Sync last 30 days
                    const now = new Date()
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    const result = await integration.syncTransactions(thirtyDaysAgo, now)

                    return NextResponse.json({
                        success: true,
                        action: 'sync',
                        result,
                    })
                }

                case 'status': {
                    const status = await integration.getStatus()
                    return NextResponse.json({
                        success: true,
                        action: 'status',
                        status,
                    })
                }

                case 'disconnect': {
                    await integration.disconnect()
                    IntegrationFactory.clearInstance(integrationType as IntegrationType, user.companyId)

                    return NextResponse.json({
                        success: true,
                        action: 'disconnect',
                        message: `${INTEGRATION_CONFIG[integrationType as IntegrationType].name} disconnected`,
                    })
                }

                case 'refresh': {
                    await integration.refreshAuth()
                    return NextResponse.json({
                        success: true,
                        action: 'refresh',
                        message: 'Authentication refreshed',
                    })
                }

                default:
                    return NextResponse.json(
                        { error: 'Invalid action. Use: sync, status, disconnect, or refresh' },
                        { status: 400 }
                    )
            }
        } catch (error) {
            if (error instanceof IntegrationError) {
                return NextResponse.json(
                    {
                        error: error.message,
                        code: error.code,
                        retryable: error.retryable,
                    },
                    { status: error.code === 'AUTH_ERROR' ? 401 : 500 }
                )
            }
            throw error
        }
    } catch (error: any) {
        console.error('Integration action error:', error)
        return NextResponse.json(
            { error: error.message || 'Integration action failed' },
            { status: 500 }
        )
    }
}
