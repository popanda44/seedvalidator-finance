/**
 * FinYeld AI - Rate Limiter Tests
 * Testing rate limiting with different configurations
 */

import {
    checkRateLimit,
    RATE_LIMIT_CONFIGS,
    RateLimitResult,
} from '../rate-limiter'

describe('Rate Limiter', () => {
    // Clear rate limit state between tests by using unique identifiers
    let testCounter = 0
    const getUniqueId = () => `test-ip-${Date.now()}-${testCounter++}`

    describe('checkRateLimit', () => {
        it('should allow requests under limit', () => {
            const ip = getUniqueId()

            const result1 = checkRateLimit(ip, 'default')
            const result2 = checkRateLimit(ip, 'default')

            expect(result1.allowed).toBe(true)
            expect(result2.allowed).toBe(true)
            expect(result2.remaining).toBeLessThan(result1.remaining)
        })

        it('should track remaining requests correctly', () => {
            const ip = getUniqueId()
            const config = RATE_LIMIT_CONFIGS.default

            const result = checkRateLimit(ip, 'default')

            expect(result.remaining).toBe(config.maxRequests - 1)
        })

        it('should block after exceeding limit', () => {
            const ip = getUniqueId()
            const config = { ...RATE_LIMIT_CONFIGS.default }

            // Make requests up to and beyond the limit
            let lastResult: RateLimitResult = { allowed: true, remaining: 0, resetTime: 0, blocked: false }

            for (let i = 0; i <= config.maxRequests + 5; i++) {
                lastResult = checkRateLimit(ip, 'default')
            }

            expect(lastResult.allowed).toBe(false)
            expect(lastResult.remaining).toBe(0)
        })

        it('should use auth config with stricter limits', () => {
            const ip = getUniqueId()
            const authConfig = RATE_LIMIT_CONFIGS.auth
            const defaultConfig = RATE_LIMIT_CONFIGS.default

            expect(authConfig.maxRequests).toBeLessThan(defaultConfig.maxRequests)

            const result = checkRateLimit(ip, 'auth')
            expect(result.remaining).toBe(authConfig.maxRequests - 1)
        })

        it('should apply blocking for auth rate limit', () => {
            const ip = getUniqueId()
            const config = RATE_LIMIT_CONFIGS.auth

            // Exceed auth limit
            for (let i = 0; i <= config.maxRequests + 1; i++) {
                checkRateLimit(ip, 'auth')
            }

            const result = checkRateLimit(ip, 'auth')

            expect(result.allowed).toBe(false)
            expect(result.blocked).toBe(true)
            expect(result.retryAfter).toBeDefined()
        })

        it('should track different identifiers separately', () => {
            const ip1 = getUniqueId()
            const ip2 = getUniqueId()

            // Exhaust limit for ip1
            for (let i = 0; i <= 100; i++) {
                checkRateLimit(ip1, 'default')
            }

            // ip2 should still be allowed
            const result = checkRateLimit(ip2, 'default')
            expect(result.allowed).toBe(true)
        })

        it('should track different configs separately for same IP', () => {
            const ip = getUniqueId()

            // Make some requests on default config
            for (let i = 0; i < 5; i++) {
                checkRateLimit(ip, 'default')
            }

            // Auth config should have its own counter
            const authResult = checkRateLimit(ip, 'auth')
            expect(authResult.remaining).toBe(RATE_LIMIT_CONFIGS.auth.maxRequests - 1)
        })
    })

    describe('Rate Limit Configurations', () => {
        it('should have correct default config', () => {
            const config = RATE_LIMIT_CONFIGS.default

            expect(config.windowMs).toBe(60 * 1000) // 1 minute
            expect(config.maxRequests).toBe(100)
        })

        it('should have correct auth config', () => {
            const config = RATE_LIMIT_CONFIGS.auth

            expect(config.windowMs).toBe(15 * 60 * 1000) // 15 minutes
            expect(config.maxRequests).toBe(10)
            expect(config.blockDurationMs).toBe(30 * 60 * 1000) // 30 min block
        })

        it('should have correct API config', () => {
            const config = RATE_LIMIT_CONFIGS.api

            expect(config.windowMs).toBe(60 * 1000) // 1 minute
            expect(config.maxRequests).toBe(60)
        })

        it('should have correct export config', () => {
            const config = RATE_LIMIT_CONFIGS.export

            expect(config.windowMs).toBe(60 * 60 * 1000) // 1 hour
            expect(config.maxRequests).toBe(10)
        })

        it('should have correct AI insights config', () => {
            const config = RATE_LIMIT_CONFIGS.aiInsights

            expect(config.windowMs).toBe(60 * 1000) // 1 minute
            expect(config.maxRequests).toBe(20)
        })
    })
})
