import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/categories - Get all categories
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const companyId = searchParams.get('companyId')
        const type = searchParams.get('type') // EXPENSE, INCOME, BOTH

        // Return sample data if no companyId
        if (!companyId) {
            return NextResponse.json(getSampleCategories())
        }

        const where: any = { companyId }
        if (type) {
            where.type = type
        }

        const categories = await prisma.category.findMany({
            where,
            orderBy: { name: 'asc' },
        })

        return NextResponse.json({
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                icon: c.icon,
                color: c.color,
                type: c.type,
                isSystem: c.isSystem,
            })),
        })
    } catch (error) {
        console.error('Categories API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

// POST /api/categories - Create a new category
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { companyId, name, icon, color, type } = body

        if (!companyId || !name) {
            return NextResponse.json(
                { error: 'Company ID and name are required' },
                { status: 400 }
            )
        }

        // Check if category already exists
        const existing = await prisma.category.findFirst({
            where: { companyId, name },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            )
        }

        const category = await prisma.category.create({
            data: {
                companyId,
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                icon: icon || '📁',
                color: color || '#6B7280',
                type: type || 'EXPENSE',
            },
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Create category error:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}

// Sample categories
function getSampleCategories() {
    return {
        categories: [
            { id: '1', name: 'Payroll & Benefits', icon: '💼', color: '#3B82F6', type: 'EXPENSE', isSystem: true },
            { id: '2', name: 'Infrastructure', icon: '🖥️', color: '#10B981', type: 'EXPENSE', isSystem: true },
            { id: '3', name: 'Marketing', icon: '📢', color: '#F59E0B', type: 'EXPENSE', isSystem: true },
            { id: '4', name: 'SaaS Tools', icon: '🔧', color: '#8B5CF6', type: 'EXPENSE', isSystem: true },
            { id: '5', name: 'Office & Rent', icon: '🏢', color: '#EC4899', type: 'EXPENSE', isSystem: true },
            { id: '6', name: 'Travel & Meals', icon: '✈️', color: '#06B6D4', type: 'EXPENSE', isSystem: true },
            { id: '7', name: 'Revenue', icon: '💰', color: '#22C55E', type: 'INCOME', isSystem: true },
            { id: '8', name: 'Investment', icon: '📈', color: '#3B82F6', type: 'INCOME', isSystem: true },
        ],
    }
}
