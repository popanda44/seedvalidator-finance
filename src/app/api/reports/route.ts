import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

interface ReportData {
    title: string;
    subtitle: string;
    generatedAt: string;
    companyName: string;
    period: string;
    keyMetrics: {
        label: string;
        value: string;
        change?: string;
        changeType?: 'positive' | 'negative' | 'neutral';
    }[];
    charts: {
        title: string;
        type: 'bar' | 'line' | 'pie';
        data: { label: string; value: number }[];
    }[];
    transactions: {
        date: string;
        description: string;
        category: string;
        amount: number;
    }[];
    summary: string;
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'executive';
        const period = searchParams.get('period') || 'month';

        const now = new Date();
        const periodLabel = period === 'month'
            ? now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : period === 'quarter'
                ? `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`
                : now.getFullYear().toString();

        // Generate report data
        const reportData: ReportData = {
            title: type === 'executive' ? 'Executive Summary' : 'Financial Report',
            subtitle: `${session.user.name || 'Your Company'} | ${periodLabel}`,
            generatedAt: now.toISOString(),
            companyName: session.user.name || 'Your Company',
            period: periodLabel,
            keyMetrics: [
                { label: 'Cash Balance', value: '$842,500', change: '+2.3%', changeType: 'positive' },
                { label: 'Monthly Burn', value: '$85,000', change: '-5.2%', changeType: 'positive' },
                { label: 'Runway', value: '9.9 months', change: '+0.5 mo', changeType: 'positive' },
                { label: 'MRR', value: '$125,000', change: '+12.5%', changeType: 'positive' },
                { label: 'ARR', value: '$1.5M', change: '+15.0%', changeType: 'positive' },
                { label: 'Gross Margin', value: '72%', change: '+3%', changeType: 'positive' },
            ],
            charts: [
                {
                    title: 'Cash Flow Trend',
                    type: 'bar',
                    data: [
                        { label: 'Jul', value: 28000 },
                        { label: 'Aug', value: 22000 },
                        { label: 'Sep', value: 10000 },
                        { label: 'Oct', value: 5000 },
                        { label: 'Nov', value: -12000 },
                        { label: 'Dec', value: -40000 },
                    ]
                },
                {
                    title: 'Expense Breakdown',
                    type: 'pie',
                    data: [
                        { label: 'Payroll', value: 45000 },
                        { label: 'Infrastructure', value: 15000 },
                        { label: 'Marketing', value: 12000 },
                        { label: 'Operations', value: 8000 },
                        { label: 'Other', value: 5000 },
                    ]
                }
            ],
            transactions: [
                { date: '2024-12-24', description: 'AWS Cloud Services', category: 'Infrastructure', amount: -12450 },
                { date: '2024-12-23', description: 'Stripe Payment', category: 'Revenue', amount: 28700 },
                { date: '2024-12-22', description: 'Gusto Payroll', category: 'Payroll', amount: -45200 },
                { date: '2024-12-21', description: 'Google Workspace', category: 'SaaS', amount: -890 },
                { date: '2024-12-20', description: 'Customer Payment', category: 'Revenue', amount: 15000 },
            ],
            summary: `This period shows strong financial performance with MRR growing 12.5% month-over-month. Cash runway remains healthy at 9.9 months.`
        };

        return NextResponse.json({
            success: true,
            report: reportData,
            downloadUrl: `/api/export?format=csv&period=${period}`
        });

    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
