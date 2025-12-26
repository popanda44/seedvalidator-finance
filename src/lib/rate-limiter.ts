/**
 * FinYeld AI - Enhanced Rate Limiter
 * Configurable rate limiting with endpoint-specific limits and Redis support
 */

import { NextResponse } from 'next/server'
import { auditLog } from './security/audit'

// ==========================================
// TYPES
// ==========================================
interface RateLimitEntry {
  count: number
  resetTime: number
  blocked?: boolean
  blockUntil?: number
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  blockDurationMs?: number
  skipSuccessfulRequests?: boolean
}

// ==========================================
// DEFAULT CONFIGURATIONS
// ==========================================
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 min
    blockDurationMs: 30 * 60 * 1000, // Block for 30 min after exceeding
  },
  authStrict: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 attempts per hour (password reset)
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  apiHeavy: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 heavy requests per minute
  },
  export: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 exports per hour
  },
  aiInsights: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 AI requests per minute
  },
}

// ==========================================
// RATE LIMIT STORE (In-memory - use Redis for production)
// ==========================================
const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
        rateLimitMap.delete(key)
      }
    }
  }, 60 * 1000)
}

// ==========================================
// RATE LIMIT CHECK
// ==========================================
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  blocked: boolean
  retryAfter?: number
}

export function checkRateLimit(
  identifier: string,
  configName: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[configName] || RATE_LIMIT_CONFIGS.default
  const now = Date.now()
  const key = `${configName}:${identifier}`

  let entry = rateLimitMap.get(key)

  // Check if blocked
  if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockUntil,
      blocked: true,
      retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
    }
  }

  // New window or expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
    }
    rateLimitMap.set(key, entry)

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
      blocked: false,
    }
  }

  // Increment count
  entry.count++

  // Check if exceeded
  if (entry.count > config.maxRequests) {
    // Apply block if configured
    if (config.blockDurationMs) {
      entry.blocked = true
      entry.blockUntil = now + config.blockDurationMs
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      blocked: !!entry.blocked,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    blocked: false,
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function getRateLimitKey(
  request: Request,
  suffix?: string
): string {
  const ip = getClientIP(request)
  return suffix ? `${ip}:${suffix}` : ip
}

// ==========================================
// MIDDLEWARE FUNCTIONS
// ==========================================
export function rateLimitMiddleware(
  request: Request,
  configName: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): RateLimitResult {
  const identifier = getRateLimitKey(request)
  return checkRateLimit(identifier, configName)
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Too Many Requests',
      message: result.blocked
        ? 'You have been temporarily blocked due to too many requests.'
        : 'Rate limit exceeded. Please try again later.',
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  )

  response.headers.set('X-RateLimit-Remaining', '0')
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}

// ==========================================
// AUTHENTICATION RATE LIMITING
// ==========================================
export async function checkAuthRateLimit(
  request: Request,
  email?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const ip = getClientIP(request)

  // Check IP-based limit
  const ipResult = checkRateLimit(ip, 'auth')
  if (!ipResult.allowed) {
    // Log security event
    await auditLog.security('SECURITY_BRUTE_FORCE_DETECTED', {
      ipAddress: ip,
      reason: 'Too many authentication attempts from IP',
      blockedUntil: ipResult.blocked ? new Date(ipResult.resetTime) : undefined,
    })

    return { allowed: false, response: rateLimitResponse(ipResult) }
  }

  // If email provided, also check email-based limit
  if (email) {
    const emailResult = checkRateLimit(`email:${email}`, 'auth')
    if (!emailResult.allowed) {
      await auditLog.security('SECURITY_BRUTE_FORCE_DETECTED', {
        ipAddress: ip,
        reason: `Too many authentication attempts for email: ${email.substring(0, 3)}***`,
      })

      return { allowed: false, response: rateLimitResponse(emailResult) }
    }
  }

  return { allowed: true }
}

// ==========================================
// API RATE LIMIT DECORATOR
// ==========================================
export function withRateLimit(
  handler: (request: Request, context?: any) => Promise<Response>,
  configName: keyof typeof RATE_LIMIT_CONFIGS = 'api'
) {
  return async (request: Request, context?: any): Promise<Response> => {
    const result = rateLimitMiddleware(request, configName)

    if (!result.allowed) {
      return rateLimitResponse(result)
    }

    const response = await handler(request, context)

    // Add rate limit headers to response
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.resetTime.toString())

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

// ==========================================
// BACKWARD COMPATIBILITY
// ==========================================

/**
 * @deprecated Use rateLimitMiddleware instead
 * Simple rate limit check for backward compatibility
 */
export function rateLimitCheck(request: Request): boolean {
  const result = rateLimitMiddleware(request, 'default')
  return result.allowed
}

/**
 * @deprecated Use rateLimitResponse(result) instead
 * Simple rate limit exceeded response
 */
export function rateLimitExceededResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    }
  )
}

// Alias for backward compatibility
export { rateLimitExceededResponse as legacyRateLimitResponse }
