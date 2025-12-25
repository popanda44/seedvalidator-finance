import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    createHubSpotClient,
    getDemoHubSpotData,
    getHubSpotAuthUrl,
    exchangeHubSpotCode
} from '@/lib/integrations/hubspot';

// GET - Fetch HubSpot data or get auth URL
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        // Return OAuth URL for connecting HubSpot
        if (action === 'auth-url') {
            const clientId = process.env.HUBSPOT_CLIENT_ID;
            if (!clientId) {
                return NextResponse.json({
                    error: 'HubSpot not configured',
                    message: 'Add HUBSPOT_CLIENT_ID to environment variables'
                }, { status: 503 });
            }

            const redirectUri = `${process.env.NEXTAUTH_URL || 'https://potent-fin.vercel.app'}/api/integrations/hubspot/callback`;
            const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString('base64');
            const authUrl = getHubSpotAuthUrl(clientId, redirectUri, state);

            return NextResponse.json({ authUrl });
        }

        // Check if HubSpot is connected
        const accessToken = process.env.HUBSPOT_ACCESS_TOKEN; // In production, fetch from DB per user

        if (!accessToken) {
            // Return demo data if not connected
            return NextResponse.json({
                connected: false,
                demo: true,
                data: getDemoHubSpotData()
            });
        }

        // Fetch real data from HubSpot
        const client = createHubSpotClient(accessToken);
        const data = await client.getRevenueData();

        return NextResponse.json({
            connected: true,
            demo: false,
            data
        });

    } catch (error) {
        console.error('HubSpot API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch HubSpot data',
            demo: true,
            data: getDemoHubSpotData()
        });
    }
}

// POST - Handle OAuth callback or disconnect
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action, code } = body;

        if (action === 'exchange-code' && code) {
            const clientId = process.env.HUBSPOT_CLIENT_ID;
            const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
                return NextResponse.json({ error: 'HubSpot not configured' }, { status: 503 });
            }

            const redirectUri = `${process.env.NEXTAUTH_URL || 'https://potent-fin.vercel.app'}/api/integrations/hubspot/callback`;

            const tokens = await exchangeHubSpotCode(code, clientId, clientSecret, redirectUri);

            // In production, save tokens to database for this user/company
            // await saveIntegration(session.user.companyId, 'hubspot', tokens);

            return NextResponse.json({
                success: true,
                message: 'HubSpot connected successfully'
            });
        }

        if (action === 'disconnect') {
            // In production, remove tokens from database
            // await removeIntegration(session.user.companyId, 'hubspot');

            return NextResponse.json({
                success: true,
                message: 'HubSpot disconnected'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('HubSpot POST error:', error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
