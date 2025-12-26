import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
    detectAnomalies,
    type Transaction,
    type AnomalyResult,
} from '@/lib/forecasting'

// POST /api/ai/anomalies - Detect transaction anomalies
export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        // Parse request body
        const body = await req.json()
        const { transactions, historicalTransactions, contamination = 0.05 } = body

        // Validate input
        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json(
                { error: 'transactions array is required' },
                { status: 400 }
            )
        }

        // Convert to proper format
        const txs: Transaction[] = transactions.map((tx: any) => ({
            id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
            amount: parseFloat(tx.amount) || 0,
            date: new Date(tx.date || Date.now()),
            category: tx.category || 'Uncategorized',
            merchant: tx.merchant || 'Unknown',
        }))

        const historicalTxs: Transaction[] = (historicalTransactions || transactions).map((tx: any) => ({
            id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
            amount: parseFloat(tx.amount) || 0,
            date: new Date(tx.date || Date.now()),
            category: tx.category || 'Uncategorized',
            merchant: tx.merchant || 'Unknown',
        }))

        // Run anomaly detection
        const results = detectAnomalies(txs, historicalTxs, contamination)

        // Separate anomalies from normal transactions
        const anomalies = results.filter((r) => r.isAnomaly)
        const normal = results.filter((r) => !r.isAnomaly)

        return NextResponse.json({
            success: true,
            summary: {
                totalTransactions: transactions.length,
                anomaliesDetected: anomalies.length,
                anomalyRate: `${((anomalies.length / transactions.length) * 100).toFixed(1)}%`,
            },
            anomalies: anomalies.map((a) => ({
                transactionId: a.transaction.id,
                amount: a.transaction.amount,
                category: a.transaction.category,
                merchant: a.transaction.merchant,
                date: a.transaction.date.toISOString(),
                score: a.score,
                reason: a.reason,
            })),
            modelVersion: 'zscore-v1.0',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Anomaly detection error:', error)
        return NextResponse.json(
            { error: 'Failed to detect anomalies' },
            { status: 500 }
        )
    }
}

// GET /api/ai/anomalies - Get sample anomaly detection demo
export async function GET(req: NextRequest) {
    // Demo data for testing
    const demoTransactions: Transaction[] = [
        { id: 'tx-1', amount: 250, date: new Date(), category: 'SaaS', merchant: 'Slack' },
        { id: 'tx-2', amount: 99, date: new Date(), category: 'SaaS', merchant: 'Notion' },
        { id: 'tx-3', amount: 15000, date: new Date(), category: 'SaaS', merchant: 'AWS' }, // Anomaly
        { id: 'tx-4', amount: 500, date: new Date(), category: 'Marketing', merchant: 'Google Ads' },
        { id: 'tx-5', amount: 75000, date: new Date(), category: 'Payroll', merchant: 'Gusto' },
        { id: 'tx-6', amount: 75000, date: new Date(), category: 'Payroll', merchant: 'Gusto' }, // Duplicate
        { id: 'tx-7', amount: 1200, date: new Date(), category: 'Office', merchant: 'WeWork' },
        { id: 'tx-8', amount: 50, date: new Date(), category: 'Office', merchant: 'Staples' },
        { id: 'tx-9', amount: 8500, date: new Date(), category: 'Office', merchant: 'Staples' }, // Anomaly - unusual amount
    ]

    // Historical data for context
    const historicalTransactions: Transaction[] = [
        { id: 'h-1', amount: 200, date: new Date('2024-11-01'), category: 'SaaS', merchant: 'Slack' },
        { id: 'h-2', amount: 220, date: new Date('2024-10-01'), category: 'SaaS', merchant: 'Slack' },
        { id: 'h-3', amount: 99, date: new Date('2024-11-01'), category: 'SaaS', merchant: 'Notion' },
        { id: 'h-4', amount: 450, date: new Date('2024-11-01'), category: 'Marketing', merchant: 'Google Ads' },
        { id: 'h-5', amount: 520, date: new Date('2024-10-01'), category: 'Marketing', merchant: 'Google Ads' },
        { id: 'h-6', amount: 72000, date: new Date('2024-11-01'), category: 'Payroll', merchant: 'Gusto' },
        { id: 'h-7', amount: 70000, date: new Date('2024-10-01'), category: 'Payroll', merchant: 'Gusto' },
        { id: 'h-8', amount: 1200, date: new Date('2024-11-01'), category: 'Office', merchant: 'WeWork' },
        { id: 'h-9', amount: 45, date: new Date('2024-11-01'), category: 'Office', merchant: 'Staples' },
        { id: 'h-10', amount: 60, date: new Date('2024-10-01'), category: 'Office', merchant: 'Staples' },
    ]

    const results = detectAnomalies(demoTransactions, historicalTransactions, 0.1)
    const anomalies = results.filter((r) => r.isAnomaly)

    return NextResponse.json({
        success: true,
        demo: true,
        summary: {
            totalTransactions: demoTransactions.length,
            anomaliesDetected: anomalies.length,
            anomalyRate: `${((anomalies.length / demoTransactions.length) * 100).toFixed(1)}%`,
        },
        anomalies: anomalies.map((a) => ({
            transactionId: a.transaction.id,
            amount: a.transaction.amount,
            category: a.transaction.category,
            merchant: a.transaction.merchant,
            score: a.score,
            reason: a.reason,
        })),
        allResults: results.map((r) => ({
            id: r.transaction.id,
            amount: r.transaction.amount,
            category: r.transaction.category,
            isAnomaly: r.isAnomaly,
            score: r.score.toFixed(2),
            reason: r.reason,
        })),
        modelVersion: 'zscore-v1.0',
        usage: {
            endpoint: 'POST /api/ai/anomalies',
            body: {
                transactions: 'array of {id, amount, date, category, merchant}',
                historicalTransactions: 'optional array for context',
                contamination: 'expected anomaly rate (default: 0.05)',
            },
        },
    })
}
