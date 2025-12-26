/**
 * FinYeld AI - Role-Based Access Control (RBAC)
 * Permission management for protected routes and resources
 */

import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auditLog } from '@/lib/security/audit'

// ==========================================
// ROLE DEFINITIONS
// ==========================================
export type UserRole = 'ADMIN' | 'OWNER' | 'MEMBER' | 'VIEWER' | 'GUEST'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
    GUEST: 0,
    VIEWER: 1,
    MEMBER: 2,
    OWNER: 3,
    ADMIN: 4,
}

// ==========================================
// PERMISSION DEFINITIONS
// ==========================================
export type Permission =
    // Dashboard
    | 'dashboard:view'
    // Transactions
    | 'transactions:view'
    | 'transactions:create'
    | 'transactions:edit'
    | 'transactions:delete'
    // Reports
    | 'reports:view'
    | 'reports:create'
    | 'reports:export'
    | 'reports:share'
    // Forecasts
    | 'forecasts:view'
    | 'forecasts:run'
    // Integrations
    | 'integrations:view'
    | 'integrations:connect'
    | 'integrations:disconnect'
    // Settings
    | 'settings:view'
    | 'settings:edit'
    // Users & Company
    | 'users:view'
    | 'users:invite'
    | 'users:edit'
    | 'users:delete'
    | 'company:edit'
    // AI Features
    | 'ai:insights'
    | 'ai:briefing'
    | 'ai:scenarios'
    // Admin
    | 'admin:access'
    | 'admin:impersonate'
    | 'admin:audit'

// ==========================================
// ROLE -> PERMISSION MAPPING
// ==========================================
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    GUEST: [
        'dashboard:view',
    ],
    VIEWER: [
        'dashboard:view',
        'transactions:view',
        'reports:view',
        'forecasts:view',
        'integrations:view',
    ],
    MEMBER: [
        'dashboard:view',
        'transactions:view',
        'transactions:create',
        'transactions:edit',
        'reports:view',
        'reports:create',
        'reports:export',
        'forecasts:view',
        'forecasts:run',
        'integrations:view',
        'settings:view',
        'ai:insights',
        'ai:briefing',
        'ai:scenarios',
    ],
    OWNER: [
        'dashboard:view',
        'transactions:view',
        'transactions:create',
        'transactions:edit',
        'transactions:delete',
        'reports:view',
        'reports:create',
        'reports:export',
        'reports:share',
        'forecasts:view',
        'forecasts:run',
        'integrations:view',
        'integrations:connect',
        'integrations:disconnect',
        'settings:view',
        'settings:edit',
        'users:view',
        'users:invite',
        'users:edit',
        'company:edit',
        'ai:insights',
        'ai:briefing',
        'ai:scenarios',
    ],
    ADMIN: [
        // Admins have all permissions
        'dashboard:view',
        'transactions:view',
        'transactions:create',
        'transactions:edit',
        'transactions:delete',
        'reports:view',
        'reports:create',
        'reports:export',
        'reports:share',
        'forecasts:view',
        'forecasts:run',
        'integrations:view',
        'integrations:connect',
        'integrations:disconnect',
        'settings:view',
        'settings:edit',
        'users:view',
        'users:invite',
        'users:edit',
        'users:delete',
        'company:edit',
        'ai:insights',
        'ai:briefing',
        'ai:scenarios',
        'admin:access',
        'admin:impersonate',
        'admin:audit',
    ],
}

// ==========================================
// ROUTE -> PERMISSION MAPPING
// ==========================================
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
    // Dashboard routes
    '/dashboard': 'dashboard:view',
    '/dashboard/expenses': 'transactions:view',
    '/dashboard/reports': 'reports:view',
    '/dashboard/forecasts': 'forecasts:view',
    '/dashboard/integrations': 'integrations:view',
    '/dashboard/settings': 'settings:view',
    '/dashboard/alerts': 'dashboard:view',
    '/dashboard/cash-flow': 'dashboard:view',

    // API routes
    '/api/transactions': 'transactions:view',
    '/api/expenses': 'transactions:view',
    '/api/reports': 'reports:view',
    '/api/forecasts': 'forecasts:view',
    '/api/integrations': 'integrations:view',
    '/api/ai/insights': 'ai:insights',
    '/api/ai/briefing': 'ai:briefing',
    '/api/ai/scenario': 'ai:scenarios',
    '/api/export': 'reports:export',

    // Admin routes
    '/admin': 'admin:access',
}

// ==========================================
// PERMISSION CHECKING
// ==========================================
export function hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || []
    return permissions.includes(permission)
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(role, permission))
}

export function isRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole]
}

// ==========================================
// ROUTE PERMISSION CHECKING
// ==========================================
export function getRoutePermission(pathname: string): Permission | null {
    // Exact match first
    if (ROUTE_PERMISSIONS[pathname]) {
        return ROUTE_PERMISSIONS[pathname]
    }

    // Pattern matching for API routes
    for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(route)) {
            return permission
        }
    }

    return null
}

// ==========================================
// AUTH CONTEXT
// ==========================================
export interface AuthContext {
    userId: string
    email: string
    role: UserRole
    companyId: string | null
    permissions: Permission[]
}

export async function getAuthContext(request?: NextRequest): Promise<AuthContext | null> {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return null
        }

        // Get user with role from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                companyId: true,
            },
        })

        if (!user) {
            return null
        }

        const role = (user.role as UserRole) || 'MEMBER'

        return {
            userId: user.id,
            email: user.email,
            role,
            companyId: user.companyId,
            permissions: ROLE_PERMISSIONS[role] || [],
        }
    } catch (error) {
        console.error('Error getting auth context:', error)
        return null
    }
}

// ==========================================
// MIDDLEWARE HELPERS
// ==========================================
export async function requireAuth(
    request: NextRequest
): Promise<{ authorized: true; context: AuthContext } | { authorized: false; response: NextResponse }> {
    const context = await getAuthContext(request)

    if (!context) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            ),
        }
    }

    return { authorized: true, context }
}

export async function requirePermission(
    request: NextRequest,
    permission: Permission
): Promise<{ authorized: true; context: AuthContext } | { authorized: false; response: NextResponse }> {
    const authResult = await requireAuth(request)

    if (!authResult.authorized) {
        return authResult
    }

    if (!hasPermission(authResult.context.role, permission)) {
        // Log unauthorized access attempt
        await auditLog.api('API_UNAUTHORIZED_ACCESS', {
            userId: authResult.context.userId,
            companyId: authResult.context.companyId || undefined,
            endpoint: request.nextUrl.pathname,
            method: request.method,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
        })

        return {
            authorized: false,
            response: NextResponse.json(
                {
                    error: 'Forbidden',
                    message: `You don't have permission to access this resource`,
                    required: permission,
                },
                { status: 403 }
            ),
        }
    }

    return { authorized: true, context: authResult.context }
}

export async function requireRole(
    request: NextRequest,
    minimumRole: UserRole
): Promise<{ authorized: true; context: AuthContext } | { authorized: false; response: NextResponse }> {
    const authResult = await requireAuth(request)

    if (!authResult.authorized) {
        return authResult
    }

    if (!isRoleAtLeast(authResult.context.role, minimumRole)) {
        await auditLog.api('API_UNAUTHORIZED_ACCESS', {
            userId: authResult.context.userId,
            companyId: authResult.context.companyId || undefined,
            endpoint: request.nextUrl.pathname,
            method: request.method,
        })

        return {
            authorized: false,
            response: NextResponse.json(
                {
                    error: 'Forbidden',
                    message: `This action requires ${minimumRole} role or higher`,
                },
                { status: 403 }
            ),
        }
    }

    return { authorized: true, context: authResult.context }
}

// ==========================================
// COMPANY ISOLATION CHECK
// ==========================================
export async function requireCompanyAccess(
    request: NextRequest,
    resourceCompanyId: string
): Promise<{ authorized: true; context: AuthContext } | { authorized: false; response: NextResponse }> {
    const authResult = await requireAuth(request)

    if (!authResult.authorized) {
        return authResult
    }

    // Admins can access all companies
    if (authResult.context.role === 'ADMIN') {
        return { authorized: true, context: authResult.context }
    }

    // Users can only access their own company's data
    if (authResult.context.companyId !== resourceCompanyId) {
        await auditLog.security('SECURITY_SUSPICIOUS_ACTIVITY', {
            userId: authResult.context.userId,
            reason: 'Attempted to access another company\'s data',
            metadata: {
                userCompanyId: authResult.context.companyId,
                requestedCompanyId: resourceCompanyId,
            },
        })

        return {
            authorized: false,
            response: NextResponse.json(
                { error: 'Forbidden', message: 'Access denied to this resource' },
                { status: 403 }
            ),
        }
    }

    return { authorized: true, context: authResult.context }
}
