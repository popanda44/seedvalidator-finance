/**
 * FinYeld AI - RBAC Tests
 * Testing role-based access control and permissions
 */

import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleAtLeast,
    getRoutePermission,
    ROLE_HIERARCHY,
    ROLE_PERMISSIONS,
    type UserRole,
    type Permission,
} from './rbac'

describe('RBAC Module', () => {
    describe('Role Hierarchy', () => {
        it('should have correct hierarchy order', () => {
            expect(ROLE_HIERARCHY.GUEST).toBeLessThan(ROLE_HIERARCHY.VIEWER)
            expect(ROLE_HIERARCHY.VIEWER).toBeLessThan(ROLE_HIERARCHY.MEMBER)
            expect(ROLE_HIERARCHY.MEMBER).toBeLessThan(ROLE_HIERARCHY.OWNER)
            expect(ROLE_HIERARCHY.OWNER).toBeLessThan(ROLE_HIERARCHY.ADMIN)
        })

        it('should define all roles', () => {
            const roles: UserRole[] = ['GUEST', 'VIEWER', 'MEMBER', 'OWNER', 'ADMIN']
            roles.forEach((role) => {
                expect(ROLE_HIERARCHY[role]).toBeDefined()
            })
        })
    })

    describe('isRoleAtLeast', () => {
        it('should compare roles correctly', () => {
            expect(isRoleAtLeast('ADMIN', 'ADMIN')).toBe(true)
            expect(isRoleAtLeast('ADMIN', 'OWNER')).toBe(true)
            expect(isRoleAtLeast('ADMIN', 'MEMBER')).toBe(true)
            expect(isRoleAtLeast('ADMIN', 'VIEWER')).toBe(true)
            expect(isRoleAtLeast('ADMIN', 'GUEST')).toBe(true)
        })

        it('should return false when role is too low', () => {
            expect(isRoleAtLeast('GUEST', 'VIEWER')).toBe(false)
            expect(isRoleAtLeast('VIEWER', 'MEMBER')).toBe(false)
            expect(isRoleAtLeast('MEMBER', 'OWNER')).toBe(false)
            expect(isRoleAtLeast('OWNER', 'ADMIN')).toBe(false)
        })

        it('should return true for same role', () => {
            const roles: UserRole[] = ['GUEST', 'VIEWER', 'MEMBER', 'OWNER', 'ADMIN']
            roles.forEach((role) => {
                expect(isRoleAtLeast(role, role)).toBe(true)
            })
        })
    })

    describe('hasPermission', () => {
        it('should allow ADMIN all permissions', () => {
            const adminPermissions = ROLE_PERMISSIONS.ADMIN
            adminPermissions.forEach((permission) => {
                expect(hasPermission('ADMIN', permission)).toBe(true)
            })
        })

        it('should restrict GUEST to basic permissions', () => {
            expect(hasPermission('GUEST', 'dashboard:view')).toBe(true)
            expect(hasPermission('GUEST', 'transactions:view')).toBe(false)
            expect(hasPermission('GUEST', 'admin:access')).toBe(false)
        })

        it('should give MEMBER typical permissions', () => {
            expect(hasPermission('MEMBER', 'dashboard:view')).toBe(true)
            expect(hasPermission('MEMBER', 'transactions:view')).toBe(true)
            expect(hasPermission('MEMBER', 'transactions:create')).toBe(true)
            expect(hasPermission('MEMBER', 'reports:view')).toBe(true)
            expect(hasPermission('MEMBER', 'ai:insights')).toBe(true)

            // But not delete or admin
            expect(hasPermission('MEMBER', 'transactions:delete')).toBe(false)
            expect(hasPermission('MEMBER', 'admin:access')).toBe(false)
        })

        it('should give OWNER management permissions', () => {
            expect(hasPermission('OWNER', 'users:invite')).toBe(true)
            expect(hasPermission('OWNER', 'company:edit')).toBe(true)
            expect(hasPermission('OWNER', 'integrations:connect')).toBe(true)
            expect(hasPermission('OWNER', 'transactions:delete')).toBe(true)

            // But not admin
            expect(hasPermission('OWNER', 'admin:access')).toBe(false)
            expect(hasPermission('OWNER', 'admin:impersonate')).toBe(false)
        })

        it('should give VIEWER read-only permissions', () => {
            expect(hasPermission('VIEWER', 'dashboard:view')).toBe(true)
            expect(hasPermission('VIEWER', 'transactions:view')).toBe(true)
            expect(hasPermission('VIEWER', 'reports:view')).toBe(true)

            // But not write
            expect(hasPermission('VIEWER', 'transactions:create')).toBe(false)
            expect(hasPermission('VIEWER', 'reports:create')).toBe(false)
        })
    })

    describe('hasAnyPermission', () => {
        it('should return true if user has any of the permissions', () => {
            expect(hasAnyPermission('MEMBER', ['admin:access', 'dashboard:view'])).toBe(true)
            expect(hasAnyPermission('MEMBER', ['transactions:create', 'transactions:edit'])).toBe(true)
        })

        it('should return false if user has none of the permissions', () => {
            expect(hasAnyPermission('GUEST', ['transactions:create', 'users:delete'])).toBe(false)
        })
    })

    describe('hasAllPermissions', () => {
        it('should return true if user has all permissions', () => {
            expect(hasAllPermissions('MEMBER', ['dashboard:view', 'transactions:view'])).toBe(true)
            expect(hasAllPermissions('ADMIN', ['admin:access', 'admin:impersonate', 'admin:audit'])).toBe(true)
        })

        it('should return false if user is missing any permission', () => {
            expect(hasAllPermissions('MEMBER', ['dashboard:view', 'admin:access'])).toBe(false)
            expect(hasAllPermissions('VIEWER', ['transactions:view', 'transactions:create'])).toBe(false)
        })
    })

    describe('getRoutePermission', () => {
        it('should return correct permission for dashboard routes', () => {
            expect(getRoutePermission('/dashboard')).toBe('dashboard:view')
            expect(getRoutePermission('/dashboard/expenses')).toBe('transactions:view')
            expect(getRoutePermission('/dashboard/reports')).toBe('reports:view')
        })

        it('should return correct permission for API routes', () => {
            expect(getRoutePermission('/api/transactions')).toBe('transactions:view')
            expect(getRoutePermission('/api/ai/insights')).toBe('ai:insights')
            expect(getRoutePermission('/api/export')).toBe('reports:export')
        })

        it('should return null for unknown routes', () => {
            expect(getRoutePermission('/unknown/route')).toBeNull()
        })

        it('should match partial API routes', () => {
            expect(getRoutePermission('/api/transactions/123')).toBe('transactions:view')
            expect(getRoutePermission('/api/reports/generate')).toBe('reports:view')
        })
    })

    describe('Permission Coverage', () => {
        it('should define permissions for all dashboard routes', () => {
            const dashboardRoutes = [
                '/dashboard',
                '/dashboard/expenses',
                '/dashboard/reports',
                '/dashboard/forecasts',
                '/dashboard/integrations',
                '/dashboard/settings',
            ]

            dashboardRoutes.forEach((route) => {
                expect(getRoutePermission(route)).not.toBeNull()
            })
        })

        it('should have AI feature permissions', () => {
            expect(hasPermission('MEMBER', 'ai:insights')).toBe(true)
            expect(hasPermission('MEMBER', 'ai:briefing')).toBe(true)
            expect(hasPermission('MEMBER', 'ai:scenarios')).toBe(true)
        })

        it('should restrict admin features appropriately', () => {
            const adminOnlyPermissions: Permission[] = ['admin:access', 'admin:impersonate', 'admin:audit']

            adminOnlyPermissions.forEach((permission) => {
                expect(hasPermission('ADMIN', permission)).toBe(true)
                expect(hasPermission('OWNER', permission)).toBe(false)
                expect(hasPermission('MEMBER', permission)).toBe(false)
            })
        })
    })
})
