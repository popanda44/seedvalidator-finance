/**
 * FinYeld AI - Request Logger Middleware
 * Comprehensive request/response logging with timing and security context
 */

import { NextRequest, NextResponse } from 'next/server'
import { auditLog } from './audit'

// ==========================================
// TYPES
// ==========================================

export interface RequestLogEntry {
    method: string
    path: string
    userId?: string
    companyId?: string
    ip?: string
    userAgent?: string
    statusCode: number
    responseTime: number
    requestSize?: number
    responseSize?: number
    error?: string
}

export interface RequestContext {
    startTime: number
    userId?: string
    companyId?: string
    requestId: string
}

// ==========================================
// REQUEST ID GENERATOR
// ==========================================

let requestCounter = 0

function generateRequestId(): string {
    const timestamp = Date.now().toString(36)
    const counter = (requestCounter++ % 1000).toString(36).padStart(3, '0')
    const random = Math.random().toString(36).substring(2, 6)
    return `req_${timestamp}_${counter}_${random}`
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Extract client IP from request headers
 */
export function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }

    return '127.0.0.1'
}

/**
 * Get request size from content-length header
 */
export function getRequestSize(request: NextRequest): number | undefined {
    const contentLength = request.headers.get('content-length')
    return contentLength ? parseInt(contentLength, 10) : undefined
}

/**
 * Mask sensitive data in URLs
 */
export function maskSensitiveUrl(url: string): string {
    return url
        .replace(/token=[^&]+/gi, 'token=***')
        .replace(/key=[^&]+/gi, 'key=***')
        .replace(/password=[^&]+/gi, 'password=***')
        .replace(/secret=[^&]+/gi, 'secret=***')
}

// ==========================================
// REQUEST LOGGER
// ==========================================

/**
 * Create a request context with timing information
 */
export function createRequestContext(
    request: NextRequest,
    userId?: string,
    companyId?: string
): RequestContext {
    return {
        startTime: Date.now(),
        userId,
        companyId,
        requestId: generateRequestId(),
    }
}

/**
 * Log a completed request
 */
export async function logRequest(
    request: NextRequest,
    response: NextResponse,
    context: RequestContext
): Promise<void> {
    const responseTime = Date.now() - context.startTime
    const path = maskSensitiveUrl(new URL(request.url).pathname)

    const logEntry: RequestLogEntry = {
        method: request.method,
        path,
        userId: context.userId,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        statusCode: response.status,
        responseTime,
        requestSize: getRequestSize(request),
    }

    // Only log to audit for significant events
    if (response.status >= 400 || responseTime > 5000) {
        await auditLog.api('API_REQUEST' as any, {
            userId: context.userId,
            companyId: context.companyId,
            endpoint: path,
            method: request.method,
            statusCode: response.status,
            ipAddress: logEntry.ip,
        })
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
        const statusColor = response.status >= 500 ? '\x1b[31m' : response.status >= 400 ? '\x1b[33m' : '\x1b[32m'
        console.log(
            `${statusColor}${request.method}\x1b[0m ${path} ${response.status} - ${responseTime}ms`
        )
    }
}

/**
 * Log an error during request processing
 */
export async function logRequestError(
    request: NextRequest,
    error: Error,
    context: RequestContext
): Promise<void> {
    const responseTime = Date.now() - context.startTime
    const path = maskSensitiveUrl(new URL(request.url).pathname)

    await auditLog.api('API_ERROR' as any, {
        userId: context.userId,
        companyId: context.companyId,
        endpoint: path,
        method: request.method,
        statusCode: 500,
        ipAddress: getClientIP(request),
    })

    // Always log errors
    console.error(`[ERROR] ${request.method} ${path} - ${responseTime}ms`, error.message)
}

// ==========================================
// MIDDLEWARE WRAPPER
// ==========================================

/**
 * Higher-order function to wrap API route handlers with logging
 */
export function withRequestLogging<T>(
    handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
    return async (request: NextRequest, context?: T): Promise<NextResponse> => {
        const reqContext = createRequestContext(request)

        try {
            const response = await handler(request, context)

            // Log the request asynchronously (don't block response)
            logRequest(request, response, reqContext).catch(() => { })

            // Add request ID header for debugging
            response.headers.set('X-Request-ID', reqContext.requestId)

            return response
        } catch (error) {
            // Log the error
            await logRequestError(
                request,
                error instanceof Error ? error : new Error(String(error)),
                reqContext
            )

            // Return error response
            return NextResponse.json(
                {
                    error: 'Internal server error',
                    requestId: reqContext.requestId,
                },
                { status: 500 }
            )
        }
    }
}

/**
 * Simple request timing for performance monitoring
 */
export function measureRequestTime(label: string): () => void {
    const start = performance.now()
    return () => {
        const duration = performance.now() - start
        if (process.env.NODE_ENV === 'development') {
            console.log(`[TIMING] ${label}: ${duration.toFixed(2)}ms`)
        }
    }
}

export default {
    createRequestContext,
    logRequest,
    logRequestError,
    withRequestLogging,
    getClientIP,
    measureRequestTime,
}
