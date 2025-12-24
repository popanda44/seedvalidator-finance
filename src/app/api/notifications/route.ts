import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendRunwayAlert, sendSpendingAlert, sendWeeklyDigest } from '@/lib/email/email-service';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, data } = body;

        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({
                error: 'Email service not configured',
                message: 'Please add RESEND_API_KEY to environment variables'
            }, { status: 503 });
        }

        let result;

        switch (type) {
            case 'runway_alert':
                result = await sendRunwayAlert(
                    data.email || session.user.email,
                    data.companyName || 'Your Company',
                    data.runway
                );
                break;

            case 'spending_alert':
                result = await sendSpendingAlert(
                    data.email || session.user.email,
                    data.companyName || 'Your Company',
                    data.category,
                    data.amount,
                    data.percentageIncrease
                );
                break;

            case 'weekly_digest':
                result = await sendWeeklyDigest(
                    data.email || session.user.email,
                    data.companyName || 'Your Company',
                    data.metrics
                );
                break;

            case 'test':
                // Send a test email
                const { sendEmail } = await import('@/lib/email/email-service');
                result = await sendEmail({
                    to: session.user.email,
                    subject: '✅ SeedValidator Email Test',
                    html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1>Email Configuration Working! 🎉</h1>
              <p>This confirms that your email notifications are properly configured.</p>
              <p>You'll receive alerts for:</p>
              <ul>
                <li>Critical runway warnings</li>
                <li>Unusual spending spikes</li>
                <li>Weekly financial digests</li>
              </ul>
              <p>Best,<br>SeedValidator Team</p>
            </div>
          `
                });
                break;

            default:
                return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully',
            id: result?.id
        });

    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json({
            error: 'Failed to send notification',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET endpoint to check notification settings
export async function GET() {
    const configured = !!process.env.RESEND_API_KEY;

    return NextResponse.json({
        email: {
            configured,
            provider: 'Resend'
        },
        sms: {
            configured: !!process.env.TWILIO_ACCOUNT_SID,
            provider: 'Twilio'
        },
        slack: {
            configured: !!process.env.SLACK_WEBHOOK_URL,
            provider: 'Slack'
        }
    });
}
