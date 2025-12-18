import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/transactions - Get paginated transactions
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('companyId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const type = searchParams.get('type') // 'income' | 'expense' | 'all'

        // Return sample data if no companyId
        if (!companyId) {
            return NextResponse.json(getSampleTransactions(page, limit, category, search, type))
        }

        // Build where clause
        const where: any = { companyId }

        if (category && category !== 'all') {
            where.category = { name: category }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { merchantName: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (startDate) {
            where.date = { ...where.date, gte: new Date(startDate) }
        }

        if (endDate) {
            where.date = { ...where.date, lte: new Date(endDate) }
        }

        if (type === 'income') {
            where.amount = { lt: 0 } // Negative amounts are income (Plaid convention)
        } else if (type === 'expense') {
            where.amount = { gt: 0 }
        }

        // Get transactions with pagination
        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    category: true,
                    bankAccount: { select: { name: true } },
                },
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ])

        // Calculate totals
        const allTransactions = await prisma.transaction.findMany({
            where: { companyId },
            select: { amount: true },
        })

        const totalInflow = allTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const totalOutflow = allTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0)

        return NextResponse.json({
            transactions: transactions.map(t => ({
                id: t.id,
                name: t.name,
                description: t.merchantName || t.name,
                amount: t.amount > 0 ? -t.amount : Math.abs(t.amount), // Convert to +/- format
                category: t.category?.name || 'Uncategorized',
                categoryColor: t.category?.color || '#6B7280',
                account: t.bankAccount.name,
                date: t.date,
                status: t.pending ? 'pending' : 'completed',
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            summary: {
                totalInflow,
                totalOutflow,
                netCashFlow: totalInflow - totalOutflow,
            },
        })
    } catch (error) {
        console.error('Transactions API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        )
    }
}

// POST /api/transactions - Create a manual transaction
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { companyId, bankAccountId, name, amount, categoryId, date, notes } = body

        if (!companyId || !bankAccountId || !name || amount === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const transaction = await prisma.transaction.create({
            data: {
                companyId,
                bankAccountId,
                name,
                amount,
                categoryId,
                date: new Date(date || Date.now()),
                notes,
                isManualCategory: true,
            },
            include: { category: true },
        })

        return NextResponse.json(transaction, { status: 201 })
    } catch (error) {
        console.error('Create transaction error:', error)
        return NextResponse.json(
            { error: 'Failed to create transaction' },
            { status: 500 }
        )
    }
}

// Sample data generator
function getSampleTransactions(
    page: number,
    limit: number,
    categoryFilter?: string | null,
    search?: string | null,
    typeFilter?: string | null
) {
    const allTransactions = [
        { id: '1', name: 'AWS Cloud Services', description: 'Monthly infrastructure', amount: -12450, category: 'Infrastructure', categoryColor: '#10B981', account: 'Chase Business', date: new Date(), status: 'completed' },
        { id: '2', name: 'Stripe Payment', description: 'Customer payment', amount: 28700, category: 'Revenue', categoryColor: '#3B82F6', account: 'Chase Business', date: new Date(Date.now() - 86400000), status: 'completed' },
        { id: '3', name: 'Gusto Payroll', description: 'Bi-weekly payroll', amount: -45200, category: 'Payroll', categoryColor: '#F59E0B', account: 'Chase Business', date: new Date(Date.now() - 2 * 86400000), status: 'completed' },
        { id: '4', name: 'Google Workspace', description: 'Monthly subscription', amount: -890, category: 'SaaS', categoryColor: '#8B5CF6', account: 'Mercury', date: new Date(Date.now() - 3 * 86400000), status: 'completed' },
        { id: '5', name: 'Slack', description: 'Team communication', amount: -750, category: 'SaaS', categoryColor: '#8B5CF6', account: 'Mercury', date: new Date(Date.now() - 4 * 86400000), status: 'completed' },
        { id: '6', name: 'Customer Invoice #1234', description: 'Enterprise client', amount: 15000, category: 'Revenue', categoryColor: '#3B82F6', account: 'Chase Business', date: new Date(Date.now() - 5 * 86400000), status: 'completed' },
        { id: '7', name: 'GitHub Enterprise', description: 'Annual subscription', amount: -3200, category: 'SaaS', categoryColor: '#8B5CF6', account: 'Mercury', date: new Date(Date.now() - 6 * 86400000), status: 'completed' },
        { id: '8', name: 'WeWork Office', description: 'Monthly office rent', amount: -4500, category: 'Office', categoryColor: '#EC4899', account: 'Chase Business', date: new Date(Date.now() - 7 * 86400000), status: 'completed' },
        { id: '9', name: 'Facebook Ads', description: 'Marketing campaign', amount: -2800, category: 'Marketing', categoryColor: '#F97316', account: 'Mercury', date: new Date(Date.now() - 8 * 86400000), status: 'pending' },
        { id: '10', name: 'Consulting Services', description: 'Customer consulting', amount: 8500, category: 'Revenue', categoryColor: '#3B82F6', account: 'Chase Business', date: new Date(Date.now() - 9 * 86400000), status: 'completed' },
        { id: '11', name: 'Vercel', description: 'Hosting', amount: -200, category: 'Infrastructure', categoryColor: '#10B981', account: 'Mercury', date: new Date(Date.now() - 10 * 86400000), status: 'completed' },
        { id: '12', name: 'Figma', description: 'Design tools', amount: -45, category: 'SaaS', categoryColor: '#8B5CF6', account: 'Mercury', date: new Date(Date.now() - 11 * 86400000), status: 'completed' },
    ]

    let filtered = allTransactions

    if (categoryFilter && categoryFilter !== 'All') {
        filtered = filtered.filter(t => t.category === categoryFilter)
    }

    if (search) {
        const s = search.toLowerCase()
        filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(s) ||
            t.description.toLowerCase().includes(s)
        )
    }

    if (typeFilter === 'income') {
        filtered = filtered.filter(t => t.amount > 0)
    } else if (typeFilter === 'expense') {
        filtered = filtered.filter(t => t.amount < 0)
    }

    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    const totalInflow = allTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const totalOutflow = Math.abs(allTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0))

    return {
        transactions: paginated,
        pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
        },
        summary: {
            totalInflow,
            totalOutflow,
            netCashFlow: totalInflow - totalOutflow,
        },
    }
}
