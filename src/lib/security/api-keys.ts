/**
 * FinYeld AI - API Key Authentication Service
 * Secure API key generation, validation, and middleware
 */

import { randomBytes, createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auditLog } from './audit'

// ==========================================
// TYPES
// ==========================================

export interface ApiKeyValidationResult {
    valid: boolean
    userId?: string
    companyId?: string
    permissions?: string[]
    error?: string
}

export interface CreateApiKeyOptions {
    name: string
    userId: string
    companyId: string
    permissions?: string[]
    expiresInDays?: number
}

// ==========================================
// API KEY SERVICE
// ==========================================

export class ApiKeyService {
    private static readonly KEY_PREFIX = 'fyk_'
    private static readonly KEY_LENGTH = 32 // bytes

    // ==========================================
    // GENERATE API KEY
    // ==========================================
    static async generate(options: CreateApiKeyOptions): Promise<string> {
        const { name, userId, companyId, permissions = [], expiresInDays } = options

        // Generate a secure random key
        const keyBytes = randomBytes(this.KEY_LENGTH)
        const keyBody = keyBytes.toString('base64url')
        const fullKey = `${this.KEY_PREFIX}${keyBody}`

        // Hash the key for storage (never store plain key)
        const keyHash = createHash('sha256').update(fullKey).digest('hex')

        // Get first 8 characters for identification
        const keyPrefix = fullKey.substring(0, 8)

        // Calculate expiration
        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : null

        // Store in database
        await prisma.apiKey.create({
            data: {
                name,
                keyHash,
                keyPrefix,
                userId,
                companyId,
                permissions,
                expiresAt,
            },
        })

        // Log the key creation
        await auditLog.security('API_KEY_GENERATION' as any, {
            userId,
            metadata: {
                keyName: name,
                keyPrefix,
                companyId,
                hasExpiration: !!expiresAt,
            },
        })

        // Return the plain key (only shown once)
        return fullKey
    }

    // ==========================================
    // VALIDATE API KEY
    // ==========================================
    static async validate(key: string): Promise<ApiKeyValidationResult> {
        // Validate key format
        if (!key || !key.startsWith(this.KEY_PREFIX)) {
            return { valid: false, error: 'Invalid API key format' }
        }

        // Hash the key for lookup
        const keyHash = createHash('sha256').update(key).digest('hex')

        // Find the key in database
        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash },
        })

        // Key not found
        if (!apiKey) {
            return { valid: false, error: 'API key not found' }
        }

        // Check if revoked
        if (apiKey.revokedAt) {
            return { valid: false, error: 'API key has been revoked' }
        }

        // Check expiration
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return { valid: false, error: 'API key has expired' }
        }

        // Update last used timestamp (fire and forget)
        prisma.apiKey
            .update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date() },
            })
            .catch(() => { }) // Ignore errors for this non-critical update

        return {
            valid: true,
            userId: apiKey.userId,
            companyId: apiKey.companyId,
            permissions: apiKey.permissions,
        }
    }

    // ==========================================
    // REVOKE API KEY
    // ==========================================
    static async revoke(keyId: string, userId: string): Promise<boolean> {
        try {
            const apiKey = await prisma.apiKey.update({
                where: { id: keyId },
                data: { revokedAt: new Date() },
            })

            // Log the revocation
            await auditLog.security('API_KEY_REVOCATION' as any, {
                userId,
                metadata: {
                    keyId,
                    keyName: apiKey.name,
                    keyPrefix: apiKey.keyPrefix,
                },
            })

            return true
        } catch {
            return false
        }
    }

    // ==========================================
    // LIST USER API KEYS
    // ==========================================
    static async listByUser(userId: string) {
        return prisma.apiKey.findMany({
            where: {
                userId,
                revokedAt: null,
            },
            select: {
                id: true,
                name: true,
                keyPrefix: true,
                permissions: true,
                lastUsedAt: true,
                expiresAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    // ==========================================
    // CHECK PERMISSION
    // ==========================================
    static hasPermission(
        apiKeyPermissions: string[],
        requiredPermission: string
    ): boolean {
        // Check for wildcard
        if (apiKeyPermissions.includes('*')) return true

        // Check for exact match
        if (apiKeyPermissions.includes(requiredPermission)) return true

        // Check for category wildcard (e.g., 'read:*' matches 'read:transactions')
        const [action, resource] = requiredPermission.split(':')
        if (apiKeyPermissions.includes(`${action}:*`)) return true
        if (apiKeyPermissions.includes(`*:${resource}`)) return true

        return false
    }
}

// ==========================================
// MIDDLEWARE
// ==========================================

/**
 * Middleware to require API key authentication
 * Extracts API key from X-API-Key header
 */
export async function requireApiKey(
    request: NextRequest
): Promise<{ response?: NextResponse; userId?: string; companyId?: string; permissions?: string[] }> {
    const apiKey = request.headers.get('X-API-Key')

    // No API key provided
    if (!apiKey) {
        return {
            response: NextResponse.json(
                {
                    error: 'Missing API key',
                    message: 'Please provide an API key in the X-API-Key header',
                },
                { status: 401 }
            ),
        }
    }

    // Validate the key
    const result = await ApiKeyService.validate(apiKey)

    if (!result.valid) {
        // Log failed authentication
        await auditLog.security('API_KEY_VALIDATION_FAILED' as any, {
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            metadata: {
                error: result.error,
                keyPrefix: apiKey.substring(0, 8),
            },
        })

        return {
            response: NextResponse.json(
                {
                    error: 'Invalid API key',
                    message: result.error,
                },
                { status: 401 }
            ),
        }
    }

    // Return user context
    return {
        userId: result.userId,
        companyId: result.companyId,
        permissions: result.permissions,
    }
}

/**
 * Middleware to require specific permission
 */
export function requirePermissionForApiKey(
    permissions: string[],
    required: string
): NextResponse | null {
    if (!ApiKeyService.hasPermission(permissions, required)) {
        return NextResponse.json(
            {
                error: 'Insufficient permissions',
                message: `This API key does not have the '${required}' permission`,
            },
            { status: 403 }
        )
    }
    return null
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Hash an API key (for comparison or storage)
 */
export function hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex')
}

/**
 * Generate a secure API key without storing it
 * Useful for one-time tokens or temporary keys
 */
export function generateTempApiKey(): string {
    const keyBytes = randomBytes(32)
    return `fyk_tmp_${keyBytes.toString('base64url')}`
}

export default ApiKeyService
