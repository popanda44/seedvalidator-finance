/**
 * FinYeld AI - Security Monitor
 * Real-time threat detection and security alerting
 */

import prisma from '@/lib/prisma'
import { auditLog } from './audit'

// ==========================================
// TYPES
// ==========================================

export type SecurityAlertType =
    | 'BRUTE_FORCE_ATTEMPT'
    | 'UNUSUAL_API_ACTIVITY'
    | 'POTENTIAL_DATA_EXFILTRATION'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT'
    | 'SUSPICIOUS_IP'
    | 'API_KEY_ABUSE'
    | 'SESSION_HIJACK_ATTEMPT'

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SecurityAlert {
    type: SecurityAlertType
    severity: AlertSeverity
    userId?: string
    companyId?: string
    ipAddress?: string
    details: Record<string, unknown>
    timestamp: Date
}

// ==========================================
// IN-MEMORY TRACKING (Use Redis in production)
// ==========================================

const failedLoginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const apiCallTracker = new Map<string, { count: number; windowStart: number }>()
const exportTracker = new Map<string, { count: number; recordsExported: number; windowStart: number }>()
const unauthorizedAccessTracker = new Map<string, { count: number; windowStart: number }>()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        const fifteenMinutes = 15 * 60 * 1000
        const oneHour = 60 * 60 * 1000

        // Clean failed logins (15 min window)
        for (const [key, data] of failedLoginAttempts.entries()) {
            if (now - data.firstAttempt > fifteenMinutes) {
                failedLoginAttempts.delete(key)
            }
        }

        // Clean API tracker (1 min window)
        for (const [key, data] of apiCallTracker.entries()) {
            if (now - data.windowStart > 60000) {
                apiCallTracker.delete(key)
            }
        }

        // Clean export tracker (1 hr window)
        for (const [key, data] of exportTracker.entries()) {
            if (now - data.windowStart > oneHour) {
                exportTracker.delete(key)
            }
        }

        // Clean unauthorized access (5 min window)
        for (const [key, data] of unauthorizedAccessTracker.entries()) {
            if (now - data.windowStart > 5 * 60 * 1000) {
                unauthorizedAccessTracker.delete(key)
            }
        }
    }, 5 * 60 * 1000)
}

// ==========================================
// SECURITY MONITOR CLASS
// ==========================================

export class SecurityMonitor {
    // ==========================================
    // DETECT BRUTE FORCE ATTACKS
    // ==========================================
    static async recordFailedLogin(
        identifier: string,
        ipAddress?: string
    ): Promise<{ attempts: number; blocked: boolean }> {
        const key = `${identifier}:${ipAddress || 'unknown'}`
        const now = Date.now()

        let entry = failedLoginAttempts.get(key)
        if (!entry || now - entry.firstAttempt > 15 * 60 * 1000) {
            entry = { count: 0, firstAttempt: now }
        }

        entry.count++
        failedLoginAttempts.set(key, entry)

        // Trigger alert at 5 attempts
        if (entry.count >= 5) {
            await this.triggerAlert({
                type: 'BRUTE_FORCE_ATTEMPT',
                severity: 'HIGH',
                ipAddress,
                details: {
                    identifier: identifier.includes('@') ? identifier.substring(0, 3) + '***' : identifier,
                    attempts: entry.count,
                    timeWindow: '15 minutes',
                },
                timestamp: new Date(),
            })

            return { attempts: entry.count, blocked: entry.count >= 10 }
        }

        return { attempts: entry.count, blocked: false }
    }

    // ==========================================
    // DETECT UNUSUAL API ACTIVITY
    // ==========================================
    static async checkApiAnomalies(
        userId: string,
        endpoint: string,
        normalRatePerMinute: number = 10
    ): Promise<{ suspicious: boolean; currentRate: number }> {
        const key = `${userId}:${endpoint}`
        const now = Date.now()

        let entry = apiCallTracker.get(key)
        if (!entry || now - entry.windowStart > 60000) {
            entry = { count: 0, windowStart: now }
        }

        entry.count++
        apiCallTracker.set(key, entry)

        // Alert if 10x normal rate
        if (entry.count > normalRatePerMinute * 10) {
            await this.triggerAlert({
                type: 'UNUSUAL_API_ACTIVITY',
                severity: 'MEDIUM',
                userId,
                details: {
                    endpoint,
                    callsPerMinute: entry.count,
                    normalRate: normalRatePerMinute,
                    multiplier: Math.round(entry.count / normalRatePerMinute),
                },
                timestamp: new Date(),
            })

            return { suspicious: true, currentRate: entry.count }
        }

        return { suspicious: false, currentRate: entry.count }
    }

    // ==========================================
    // DETECT DATA EXFILTRATION
    // ==========================================
    static async checkDataExport(
        userId: string,
        recordCount: number,
        exportType: string
    ): Promise<{ flagged: boolean; reason?: string }> {
        const key = userId
        const now = Date.now()

        let entry = exportTracker.get(key)
        if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
            entry = { count: 0, recordsExported: 0, windowStart: now }
        }

        entry.count++
        entry.recordsExported += recordCount
        exportTracker.set(key, entry)

        // Flag large single export
        if (recordCount > 10000) {
            await this.triggerAlert({
                type: 'POTENTIAL_DATA_EXFILTRATION',
                severity: 'CRITICAL',
                userId,
                details: {
                    exportType,
                    recordCount,
                    reason: 'Single export exceeds 10,000 records',
                },
                timestamp: new Date(),
            })

            return { flagged: true, reason: 'Export size exceeds limit' }
        }

        // Flag too many exports
        if (entry.count > 5) {
            await this.triggerAlert({
                type: 'POTENTIAL_DATA_EXFILTRATION',
                severity: 'HIGH',
                userId,
                details: {
                    exportType,
                    exportsInHour: entry.count,
                    totalRecords: entry.recordsExported,
                    reason: 'More than 5 exports in 1 hour',
                },
                timestamp: new Date(),
            })

            return { flagged: true, reason: 'Too many exports in short period' }
        }

        return { flagged: false }
    }

    // ==========================================
    // DETECT UNAUTHORIZED ACCESS
    // ==========================================
    static async checkUnauthorizedAccess(
        userId: string,
        resource: string,
        ipAddress?: string
    ): Promise<{ shouldSuspend: boolean; attempts: number }> {
        const key = userId
        const now = Date.now()

        let entry = unauthorizedAccessTracker.get(key)
        if (!entry || now - entry.windowStart > 5 * 60 * 1000) {
            entry = { count: 0, windowStart: now }
        }

        entry.count++
        unauthorizedAccessTracker.set(key, entry)

        // Alert at 3 attempts
        if (entry.count >= 3) {
            await this.triggerAlert({
                type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
                severity: 'HIGH',
                userId,
                ipAddress,
                details: {
                    resource,
                    attempts: entry.count,
                    timeWindow: '5 minutes',
                },
                timestamp: new Date(),
            })

            // Auto-suspend at 5 attempts
            if (entry.count >= 5) {
                await this.suspendAccount(userId, 'Multiple unauthorized access attempts')
                return { shouldSuspend: true, attempts: entry.count }
            }
        }

        return { shouldSuspend: false, attempts: entry.count }
    }

    // ==========================================
    // TRIGGER SECURITY ALERT
    // ==========================================
    private static async triggerAlert(alert: SecurityAlert): Promise<void> {
        // Console logging (always)
        const emoji = this.getSeverityEmoji(alert.severity)
        console.error(`${emoji} [SECURITY ALERT] ${alert.type}`, {
            severity: alert.severity,
            timestamp: alert.timestamp.toISOString(),
            ...alert.details,
        })

        // Log to audit system
        await auditLog.security(`SECURITY_${alert.type}` as any, {
            userId: alert.userId,
            ipAddress: alert.ipAddress,
            metadata: alert.details,
        })

        // Send to Slack (if configured)
        if (process.env.SLACK_SECURITY_WEBHOOK) {
            await this.sendSlackAlert(alert).catch((err) => {
                console.error('Failed to send Slack alert:', err.message)
            })
        }

        // For critical alerts, additional notification
        if (alert.severity === 'CRITICAL' && process.env.PAGERDUTY_ROUTING_KEY) {
            await this.sendPagerDutyAlert(alert).catch((err) => {
                console.error('Failed to send PagerDuty alert:', err.message)
            })
        }
    }

    // ==========================================
    // SLACK INTEGRATION
    // ==========================================
    private static async sendSlackAlert(alert: SecurityAlert): Promise<void> {
        const webhookUrl = process.env.SLACK_SECURITY_WEBHOOK
        if (!webhookUrl) return

        const severityColors: Record<AlertSeverity, string> = {
            LOW: '#36a64f',
            MEDIUM: '#ffcc00',
            HIGH: '#ff9900',
            CRITICAL: '#ff0000',
        }

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                attachments: [
                    {
                        color: severityColors[alert.severity],
                        blocks: [
                            {
                                type: 'header',
                                text: {
                                    type: 'plain_text',
                                    text: `🚨 Security Alert: ${alert.type}`,
                                },
                            },
                            {
                                type: 'section',
                                fields: [
                                    { type: 'mrkdwn', text: `*Severity:*\n${alert.severity}` },
                                    { type: 'mrkdwn', text: `*Time:*\n${alert.timestamp.toISOString()}` },
                                ],
                            },
                            {
                                type: 'section',
                                text: {
                                    type: 'mrkdwn',
                                    text: `*Details:*\n\`\`\`${JSON.stringify(alert.details, null, 2)}\`\`\``,
                                },
                            },
                        ],
                    },
                ],
            }),
        })
    }

    // ==========================================
    // PAGERDUTY INTEGRATION
    // ==========================================
    private static async sendPagerDutyAlert(alert: SecurityAlert): Promise<void> {
        const routingKey = process.env.PAGERDUTY_ROUTING_KEY
        if (!routingKey) return

        await fetch('https://events.pagerduty.com/v2/enqueue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                routing_key: routingKey,
                event_action: 'trigger',
                payload: {
                    summary: `Security Alert: ${alert.type}`,
                    severity: alert.severity.toLowerCase(),
                    source: 'FinYeld AI Security Monitor',
                    custom_details: alert.details,
                },
            }),
        })
    }

    // ==========================================
    // ACCOUNT SUSPENSION
    // ==========================================
    private static async suspendAccount(userId: string, reason: string): Promise<void> {
        try {
            // Log the suspension
            console.error(`[SECURITY] Auto-suspending account: ${userId}`, { reason })

            await auditLog.security('ACCOUNT_AUTO_SUSPENDED' as any, {
                userId,
                reason,
                metadata: { automated: true },
            })

            // In production, update user record
            // await prisma.user.update({
            //   where: { id: userId },
            //   data: { 
            //     isSuspended: true,
            //     suspendedAt: new Date(),
            //     suspensionReason: reason,
            //   },
            // })
        } catch (error) {
            console.error('Failed to suspend account:', error)
        }
    }

    // ==========================================
    // HELPERS
    // ==========================================
    private static getSeverityEmoji(severity: AlertSeverity): string {
        const emojis: Record<AlertSeverity, string> = {
            LOW: 'ℹ️',
            MEDIUM: '⚠️',
            HIGH: '🔴',
            CRITICAL: '🚨',
        }
        return emojis[severity]
    }

    // Get current security status
    static getSecurityStats(): {
        failedLogins: number
        trackedApiCalls: number
        trackedExports: number
        unauthorizedAttempts: number
    } {
        return {
            failedLogins: failedLoginAttempts.size,
            trackedApiCalls: apiCallTracker.size,
            trackedExports: exportTracker.size,
            unauthorizedAttempts: unauthorizedAccessTracker.size,
        }
    }
}

export default SecurityMonitor
