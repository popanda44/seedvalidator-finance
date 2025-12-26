/**
 * FinYeld AI - Audit Logging System
 * Comprehensive logging for security and compliance
 */

import prisma from '@/lib/prisma'
import { maskSensitiveData } from './encryption'

// ==========================================
// AUDIT EVENT TYPES
// ==========================================
export type AuditEventType =
    // Authentication events
    | 'AUTH_LOGIN_SUCCESS'
    | 'AUTH_LOGIN_FAILED'
    | 'AUTH_LOGOUT'
    | 'AUTH_PASSWORD_RESET_REQUEST'
    | 'AUTH_PASSWORD_RESET_COMPLETE'
    | 'AUTH_MFA_ENABLED'
    | 'AUTH_MFA_DISABLED'
    | 'AUTH_SESSION_EXPIRED'
    // User management
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'USER_DELETED'
    | 'USER_ROLE_CHANGED'
    // Data access
    | 'DATA_EXPORT'
    | 'DATA_IMPORT'
    | 'SENSITIVE_DATA_ACCESS'
    | 'REPORT_GENERATED'
    | 'REPORT_SHARED'
    // Integration events
    | 'INTEGRATION_CONNECTED'
    | 'INTEGRATION_DISCONNECTED'
    | 'INTEGRATION_SYNC_SUCCESS'
    | 'INTEGRATION_SYNC_FAILED'
    | 'WEBHOOK_RECEIVED'
    // API events
    | 'API_KEY_CREATED'
    | 'API_KEY_REVOKED'
    | 'API_RATE_LIMIT_EXCEEDED'
    | 'API_UNAUTHORIZED_ACCESS'
    // Admin actions
    | 'ADMIN_SETTINGS_CHANGED'
    | 'ADMIN_USER_IMPERSONATION'
    | 'ADMIN_DATA_DELETION'
    // Security events
    | 'SECURITY_SUSPICIOUS_ACTIVITY'
    | 'SECURITY_BRUTE_FORCE_DETECTED'
    | 'SECURITY_IP_BLOCKED'

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AuditLogEntry {
    eventType: AuditEventType
    severity: AuditSeverity
    userId?: string
    companyId?: string
    ipAddress?: string
    userAgent?: string
    resource?: string
    resourceId?: string
    action?: string
    details?: Record<string, unknown>
    metadata?: Record<string, unknown>
}

// ==========================================
// AUDIT SEVERITY MAPPING
// ==========================================
const severityMap: Record<AuditEventType, AuditSeverity> = {
    // Low severity - routine operations
    AUTH_LOGIN_SUCCESS: 'LOW',
    AUTH_LOGOUT: 'LOW',
    DATA_EXPORT: 'LOW',
    REPORT_GENERATED: 'LOW',
    INTEGRATION_SYNC_SUCCESS: 'LOW',
    WEBHOOK_RECEIVED: 'LOW',

    // Medium severity - notable events
    AUTH_LOGIN_FAILED: 'MEDIUM',
    AUTH_PASSWORD_RESET_REQUEST: 'MEDIUM',
    AUTH_PASSWORD_RESET_COMPLETE: 'MEDIUM',
    USER_CREATED: 'MEDIUM',
    USER_UPDATED: 'MEDIUM',
    INTEGRATION_CONNECTED: 'MEDIUM',
    INTEGRATION_DISCONNECTED: 'MEDIUM',
    INTEGRATION_SYNC_FAILED: 'MEDIUM',
    API_KEY_CREATED: 'MEDIUM',
    DATA_IMPORT: 'MEDIUM',
    REPORT_SHARED: 'MEDIUM',

    // High severity - security-relevant events
    AUTH_MFA_ENABLED: 'HIGH',
    AUTH_MFA_DISABLED: 'HIGH',
    AUTH_SESSION_EXPIRED: 'HIGH',
    USER_DELETED: 'HIGH',
    USER_ROLE_CHANGED: 'HIGH',
    SENSITIVE_DATA_ACCESS: 'HIGH',
    API_KEY_REVOKED: 'HIGH',
    API_RATE_LIMIT_EXCEEDED: 'HIGH',
    API_UNAUTHORIZED_ACCESS: 'HIGH',
    ADMIN_SETTINGS_CHANGED: 'HIGH',
    ADMIN_USER_IMPERSONATION: 'HIGH',

    // Critical severity - immediate attention required
    ADMIN_DATA_DELETION: 'CRITICAL',
    SECURITY_SUSPICIOUS_ACTIVITY: 'CRITICAL',
    SECURITY_BRUTE_FORCE_DETECTED: 'CRITICAL',
    SECURITY_IP_BLOCKED: 'CRITICAL',
}

// ==========================================
// AUDIT LOGGER CLASS
// ==========================================
class AuditLogger {
    private static instance: AuditLogger
    private buffer: AuditLogEntry[] = []
    private flushInterval: NodeJS.Timeout | null = null
    private readonly BUFFER_SIZE = 50
    private readonly FLUSH_INTERVAL_MS = 5000

    private constructor() {
        // Start periodic flush
        this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS)
    }

    static getInstance(): AuditLogger {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger()
        }
        return AuditLogger.instance
    }

    /**
     * Log an audit event
     */
    async log(entry: AuditLogEntry): Promise<void> {
        // Add severity if not provided
        if (!entry.severity) {
            entry.severity = severityMap[entry.eventType] || 'LOW'
        }

        // Mask sensitive data in details
        if (entry.details) {
            entry.details = this.maskSensitiveDetails(entry.details)
        }

        // Add to buffer
        this.buffer.push(entry)

        // Console log for high/critical severity
        if (entry.severity === 'HIGH' || entry.severity === 'CRITICAL') {
            console.log(`[AUDIT][${entry.severity}] ${entry.eventType}`, {
                userId: entry.userId,
                resource: entry.resource,
                ip: entry.ipAddress,
            })
        }

        // Flush if buffer is full
        if (this.buffer.length >= this.BUFFER_SIZE) {
            await this.flush()
        }
    }

    /**
     * Flush buffered entries to database
     */
    async flush(): Promise<void> {
        if (this.buffer.length === 0) return

        const entries = [...this.buffer]
        this.buffer = []

        try {
            // Try to write to database
            await prisma.auditLog.createMany({
                data: entries.map((entry) => ({
                    eventType: entry.eventType,
                    severity: entry.severity,
                    userId: entry.userId,
                    companyId: entry.companyId,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                    resource: entry.resource,
                    resourceId: entry.resourceId,
                    action: entry.action,
                    details: entry.details as any,
                    metadata: entry.metadata as any,
                    createdAt: new Date(),
                })),
                skipDuplicates: true,
            })
        } catch (error) {
            // If database write fails, log to console
            console.error('Failed to write audit logs to database:', error)
            entries.forEach((entry) => {
                console.log(`[AUDIT][${entry.severity}] ${entry.eventType}`, JSON.stringify(entry))
            })
        }
    }

    /**
     * Mask sensitive data in details object
     */
    private maskSensitiveDetails(details: Record<string, unknown>): Record<string, unknown> {
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken', 'creditCard']
        const masked: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(details)) {
            if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
                masked[key] = typeof value === 'string' ? maskSensitiveData(value) : '***'
            } else if (typeof value === 'object' && value !== null) {
                masked[key] = this.maskSensitiveDetails(value as Record<string, unknown>)
            } else {
                masked[key] = value
            }
        }

        return masked
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval)
        }
        this.flush()
    }
}

// ==========================================
// CONVENIENCE FUNCTIONS
// ==========================================
const logger = AuditLogger.getInstance()

export const auditLog = {
    /**
     * Log an authentication event
     */
    async auth(
        eventType: AuditEventType,
        userId: string | undefined,
        details: {
            email?: string
            ipAddress?: string
            userAgent?: string
            success?: boolean
            reason?: string
        }
    ): Promise<void> {
        await logger.log({
            eventType,
            severity: severityMap[eventType],
            userId,
            ipAddress: details.ipAddress,
            userAgent: details.userAgent,
            resource: 'authentication',
            details: {
                email: details.email,
                success: details.success,
                reason: details.reason,
            },
        })
    },

    /**
     * Log a data access event
     */
    async dataAccess(
        userId: string,
        companyId: string,
        resource: string,
        resourceId: string,
        action: 'read' | 'create' | 'update' | 'delete',
        details?: Record<string, unknown>
    ): Promise<void> {
        const eventType: AuditEventType =
            action === 'delete' ? 'ADMIN_DATA_DELETION' : 'SENSITIVE_DATA_ACCESS'

        await logger.log({
            eventType,
            severity: action === 'delete' ? 'CRITICAL' : 'HIGH',
            userId,
            companyId,
            resource,
            resourceId,
            action,
            details,
        })
    },

    /**
     * Log an integration event
     */
    async integration(
        eventType: AuditEventType,
        companyId: string,
        integrationType: string,
        details?: Record<string, unknown>
    ): Promise<void> {
        await logger.log({
            eventType,
            severity: severityMap[eventType],
            companyId,
            resource: 'integration',
            resourceId: integrationType,
            details,
        })
    },

    /**
     * Log a security event
     */
    async security(
        eventType: AuditEventType,
        details: {
            ipAddress?: string
            userId?: string
            reason?: string
            blockedUntil?: Date
            metadata?: Record<string, unknown>
        }
    ): Promise<void> {
        await logger.log({
            eventType,
            severity: 'CRITICAL',
            userId: details.userId,
            ipAddress: details.ipAddress,
            resource: 'security',
            details: {
                reason: details.reason,
                blockedUntil: details.blockedUntil,
            },
            metadata: details.metadata,
        })
    },

    /**
     * Log an API event
     */
    async api(
        eventType: AuditEventType,
        details: {
            userId?: string
            companyId?: string
            endpoint?: string
            method?: string
            statusCode?: number
            ipAddress?: string
        }
    ): Promise<void> {
        await logger.log({
            eventType,
            severity: severityMap[eventType],
            userId: details.userId,
            companyId: details.companyId,
            ipAddress: details.ipAddress,
            resource: 'api',
            resourceId: details.endpoint,
            action: details.method,
            details: {
                statusCode: details.statusCode,
            },
        })
    },

    /**
     * Force flush logs (useful before shutdown)
     */
    async flush(): Promise<void> {
        await logger.flush()
    },
}

export default auditLog
