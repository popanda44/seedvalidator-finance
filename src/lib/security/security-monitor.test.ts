/**
 * FinYeld AI - Security Monitor Unit Tests
 * Testing threat detection, rate limiting, and alerting
 */

import { SecurityMonitor } from './security-monitor'

// Mock the audit log
jest.mock('./audit', () => ({
    auditLog: {
        security: jest.fn().mockResolvedValue(undefined),
    },
}))

describe('SecurityMonitor', () => {
    beforeEach(() => {
        // Clear any tracked state between tests
        jest.clearAllMocks()
    })

    describe('recordFailedLogin', () => {
        it('should track failed login attempts', async () => {
            const result = await SecurityMonitor.recordFailedLogin('test@example.com', '192.168.1.1')

            expect(result.attempts).toBeGreaterThanOrEqual(1)
            expect(result.blocked).toBe(false)
        })

        it('should not block on first few attempts', async () => {
            const result = await SecurityMonitor.recordFailedLogin('newuser@test.com', '10.0.0.1')

            expect(result.attempts).toBe(1)
            expect(result.blocked).toBe(false)
        })
    })

    describe('checkApiAnomalies', () => {
        it('should not flag normal API activity', async () => {
            const result = await SecurityMonitor.checkApiAnomalies(
                'user_123',
                '/api/dashboard',
                10 // 10 calls/min is normal
            )

            expect(result.suspicious).toBe(false)
            expect(result.currentRate).toBeGreaterThanOrEqual(1)
        })

        it('should track API call count', async () => {
            // Multiple calls to same endpoint
            let lastResult = { suspicious: false, currentRate: 0 }
            for (let i = 0; i < 5; i++) {
                lastResult = await SecurityMonitor.checkApiAnomalies('user_abc', '/api/test', 10)
            }

            expect(lastResult.currentRate).toBe(5)
            expect(lastResult.suspicious).toBe(false) // Still under 10x threshold
        })
    })

    describe('checkDataExport', () => {
        it('should allow small exports', async () => {
            const result = await SecurityMonitor.checkDataExport('user_123', 500, 'csv')

            expect(result.flagged).toBe(false)
            expect(result.reason).toBeUndefined()
        })

        it('should flag large exports (>10k records)', async () => {
            const result = await SecurityMonitor.checkDataExport('user_456', 15000, 'csv')

            expect(result.flagged).toBe(true)
            expect(result.reason).toBe('Export size exceeds limit')
        })
    })

    describe('checkUnauthorizedAccess', () => {
        it('should track unauthorized access attempts', async () => {
            const result = await SecurityMonitor.checkUnauthorizedAccess(
                'user_789',
                '/admin/settings',
                '192.168.1.100'
            )

            expect(result.shouldSuspend).toBe(false)
            expect(result.attempts).toBeGreaterThanOrEqual(1)
        })
    })

    describe('getSecurityStats', () => {
        it('should return current tracking stats', () => {
            const stats = SecurityMonitor.getSecurityStats()

            expect(stats).toHaveProperty('failedLogins')
            expect(stats).toHaveProperty('trackedApiCalls')
            expect(stats).toHaveProperty('trackedExports')
            expect(stats).toHaveProperty('unauthorizedAttempts')

            expect(typeof stats.failedLogins).toBe('number')
            expect(typeof stats.trackedApiCalls).toBe('number')
        })
    })
})

describe('Security Severity Classification', () => {
    const getSeverity = (type: string): string => {
        const severityMap: Record<string, string> = {
            BRUTE_FORCE_ATTEMPT: 'HIGH',
            UNUSUAL_API_ACTIVITY: 'MEDIUM',
            POTENTIAL_DATA_EXFILTRATION: 'CRITICAL',
            UNAUTHORIZED_ACCESS_ATTEMPT: 'HIGH',
        }
        return severityMap[type] || 'MEDIUM'
    }

    it('should classify brute force as HIGH', () => {
        expect(getSeverity('BRUTE_FORCE_ATTEMPT')).toBe('HIGH')
    })

    it('should classify unusual API activity as MEDIUM', () => {
        expect(getSeverity('UNUSUAL_API_ACTIVITY')).toBe('MEDIUM')
    })

    it('should classify data exfiltration as CRITICAL', () => {
        expect(getSeverity('POTENTIAL_DATA_EXFILTRATION')).toBe('CRITICAL')
    })

    it('should classify unauthorized access as HIGH', () => {
        expect(getSeverity('UNAUTHORIZED_ACCESS_ATTEMPT')).toBe('HIGH')
    })

    it('should default to MEDIUM for unknown types', () => {
        expect(getSeverity('UNKNOWN_ALERT')).toBe('MEDIUM')
    })
})

describe('PII Scrubbing', () => {
    const scrubPII = (message: string): string => {
        return message
            .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
            .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
            .replace(/\bfyk_[a-zA-Z0-9_-]+\b/g, '[API_KEY]')
    }

    it('should mask email addresses', () => {
        const result = scrubPII('User test@example.com logged in')
        expect(result).toBe('User [EMAIL] logged in')
    })

    it('should mask SSN patterns', () => {
        const result = scrubPII('SSN: 123-45-6789')
        expect(result).toBe('SSN: [SSN]')
    })

    it('should mask API keys', () => {
        const result = scrubPII('Key: fyk_abc123XYZ_test')
        expect(result).toBe('Key: [API_KEY]')
    })

    it('should mask multiple PII types', () => {
        const input = 'User john@test.com with fyk_secret123 and SSN 999-88-7777'
        const result = scrubPII(input)

        expect(result).not.toContain('john@test.com')
        expect(result).not.toContain('fyk_secret123')
        expect(result).not.toContain('999-88-7777')
        expect(result).toContain('[EMAIL]')
        expect(result).toContain('[API_KEY]')
        expect(result).toContain('[SSN]')
    })

    it('should not modify safe strings', () => {
        const safe = 'Normal log message without PII'
        expect(scrubPII(safe)).toBe(safe)
    })
})
