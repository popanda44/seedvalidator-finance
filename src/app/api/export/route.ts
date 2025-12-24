import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Type definitions
interface Transaction {
    id: string;
    date: string;
    name: string;
    category: string;
    amount: number;
}

interface ExportData {
    companyName: string;
    generatedAt: string;
    metrics: {
        cashBalance: number;
        burnRate: number;
        runway: number;
        mrr: number;
    };
    transactions: Transaction[];
}

// Generate CSV content
function generateCSV(data: ExportData): string {
    const lines: string[] = [];

    // Header section
    lines.push(`SeedValidator Financial Report`);
    lines.push(`Company: ${data.companyName}`);
    lines.push(`Generated: ${data.generatedAt}`);
    lines.push('');

    // Metrics section
    lines.push('KEY METRICS');
    lines.push(`Cash Balance,$${data.metrics.cashBalance.toLocaleString()}`);
    lines.push(`Monthly Burn,$${data.metrics.burnRate.toLocaleString()}`);
    lines.push(`Runway,${data.metrics.runway.toFixed(1)} months`);
    lines.push(`MRR,$${data.metrics.mrr.toLocaleString()}`);
    lines.push('');

    // Transactions section
    lines.push('TRANSACTIONS');
    lines.push('Date,Description,Category,Amount');

    data.transactions.forEach(tx => {
        lines.push(`${tx.date},"${tx.name}",${tx.category},$${tx.amount.toLocaleString()}`);
    });

    return lines.join('\n');
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'csv';
        const period = searchParams.get('period') || 'month';

        // In production, fetch from database
        // For now, return sample data
        const exportData: ExportData = {
            companyName: session.user.name || 'Your Company',
            generatedAt: new Date().toISOString(),
            metrics: {
                cashBalance: 842500,
                burnRate: 85000,
                runway: 9.9,
                mrr: 125000
            },
            transactions: [
                { id: '1', date: '2024-12-24', name: 'AWS Cloud Services', category: 'Infrastructure', amount: -12450 },
                { id: '2', date: '2024-12-23', name: 'Stripe Payment', category: 'Revenue', amount: 28700 },
                { id: '3', date: '2024-12-22', name: 'Gusto Payroll', category: 'Payroll', amount: -45200 },
                { id: '4', date: '2024-12-21', name: 'Google Workspace', category: 'SaaS', amount: -890 },
                { id: '5', date: '2024-12-20', name: 'Customer Payment', category: 'Revenue', amount: 15000 },
                { id: '6', date: '2024-12-19', name: 'Slack', category: 'SaaS', amount: -1200 },
                { id: '7', date: '2024-12-18', name: 'Figma', category: 'SaaS', amount: -450 },
                { id: '8', date: '2024-12-17', name: 'Office Rent', category: 'Operations', amount: -8500 },
            ]
        };

        if (format === 'csv' || format === 'excel') {
            const csv = generateCSV(exportData);
            // Add BOM for Excel to recognize UTF-8
            const csvWithBom = '\uFEFF' + csv;

            return new NextResponse(csvWithBom, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="seedvalidator-report-${period}.csv"`,
                },
            });
        }

        if (format === 'json') {
            return NextResponse.json(exportData);
        }

        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { format, data } = body;

        // Custom data export
        if (format === 'csv') {
            const csv = generateCSV(data);
            const csvWithBom = '\uFEFF' + csv;

            return new NextResponse(csvWithBom, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="custom-export.csv"`,
                },
            });
        }

        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
