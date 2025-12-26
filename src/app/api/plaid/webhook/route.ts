import { NextResponse } from 'next/server'

// POST /api/plaid/webhook - Handle Plaid webhooks
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { webhook_type, webhook_code, item_id } = body

    console.log(`Plaid webhook received: ${webhook_type} - ${webhook_code} for item ${item_id}`)

    // Acknowledge receipt - actual processing will be implemented when DB is connected
    return NextResponse.json({
      received: true,
      webhook_type,
      webhook_code,
      message: 'Webhook received and logged',
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true, error: 'Processing failed' })
  }
}
