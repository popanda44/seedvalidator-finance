/**
 * FinYeld AI - Security Headers Configuration
 * OWASP recommended security headers for enterprise-grade security
 */

export interface SecurityHeadersConfig {
    enableHSTS: boolean
    enableCSP: boolean
    enableFrameGuard: boolean
    enableXSSFilter: boolean
    enableNoSniff: boolean
    enableReferrerPolicy: boolean
    customCSP?: string
}

const defaultConfig: SecurityHeadersConfig = {
    enableHSTS: true,
    enableCSP: true,
    enableFrameGuard: true,
    enableXSSFilter: true,
    enableNoSniff: true,
    enableReferrerPolicy: true,
}

/**
 * Content Security Policy directives
 */
const getCSPDirectives = (): string => {
    const directives = [
        // Default source
        "default-src 'self'",

        // Scripts - allow self, Vercel analytics, and inline for Next.js
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com",

        // Styles - allow self and inline for styled-components/emotion
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

        // Images - allow self, data URIs, and common CDNs
        "img-src 'self' data: blob: https: http:",

        // Fonts
        "font-src 'self' https://fonts.gstatic.com data:",

        // Connect (API calls)
        "connect-src 'self' https://*.vercel.app https://vercel.live wss://*.vercel.live https://api.stripe.com https://*.plaid.com https://*.salesforce.com https://api.openai.com https://*.posthog.com",

        // Frame ancestors - prevent clickjacking
        "frame-ancestors 'self'",

        // Form actions
        "form-action 'self'",

        // Base URI
        "base-uri 'self'",

        // Object sources
        "object-src 'none'",

        // Upgrade insecure requests in production
        process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
    ].filter(Boolean)

    return directives.join('; ')
}

/**
 * Generate security headers object
 */
export function getSecurityHeaders(config: Partial<SecurityHeadersConfig> = {}): Record<string, string> {
    const mergedConfig = { ...defaultConfig, ...config }
    const headers: Record<string, string> = {}

    // HSTS - HTTP Strict Transport Security
    if (mergedConfig.enableHSTS && process.env.NODE_ENV === 'production') {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    }

    // Content Security Policy
    if (mergedConfig.enableCSP) {
        headers['Content-Security-Policy'] = mergedConfig.customCSP || getCSPDirectives()
    }

    // X-Frame-Options - Prevent clickjacking
    if (mergedConfig.enableFrameGuard) {
        headers['X-Frame-Options'] = 'SAMEORIGIN'
    }

    // X-XSS-Protection - Enable browser XSS filter
    if (mergedConfig.enableXSSFilter) {
        headers['X-XSS-Protection'] = '1; mode=block'
    }

    // X-Content-Type-Options - Prevent MIME type sniffing
    if (mergedConfig.enableNoSniff) {
        headers['X-Content-Type-Options'] = 'nosniff'
    }

    // Referrer Policy - Control referrer information
    if (mergedConfig.enableReferrerPolicy) {
        headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    }

    // Additional security headers
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=(self)'
    headers['X-DNS-Prefetch-Control'] = 'on'
    headers['X-Download-Options'] = 'noopen'
    headers['X-Permitted-Cross-Domain-Policies'] = 'none'

    return headers
}

/**
 * Security headers for Next.js config
 */
export function getSecurityHeadersForNextConfig(): Array<{ key: string; value: string }> {
    const headers = getSecurityHeaders()

    return Object.entries(headers).map(([key, value]) => ({
        key,
        value,
    }))
}

/**
 * CORS configuration
 */
export interface CORSConfig {
    allowedOrigins: string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    allowCredentials: boolean
    maxAge: number
}

export const defaultCORSConfig: CORSConfig = {
    allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || 'https://potent-fin.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
    allowCredentials: true,
    maxAge: 86400, // 24 hours
}

/**
 * Get CORS headers for a request
 */
export function getCORSHeaders(
    origin: string | null,
    config: Partial<CORSConfig> = {}
): Record<string, string> {
    const mergedConfig = { ...defaultCORSConfig, ...config }
    const headers: Record<string, string> = {}

    // Check if origin is allowed
    const isAllowed = origin && mergedConfig.allowedOrigins.some(
        (allowed) => allowed === '*' || allowed === origin || origin.endsWith(allowed.replace('*', ''))
    )

    if (isAllowed && origin) {
        headers['Access-Control-Allow-Origin'] = origin
    }

    headers['Access-Control-Allow-Methods'] = mergedConfig.allowedMethods.join(', ')
    headers['Access-Control-Allow-Headers'] = mergedConfig.allowedHeaders.join(', ')

    if (mergedConfig.allowCredentials) {
        headers['Access-Control-Allow-Credentials'] = 'true'
    }

    headers['Access-Control-Max-Age'] = mergedConfig.maxAge.toString()

    return headers
}

/**
 * Apply security headers to NextResponse
 */
export function applySecurityHeaders(response: Response): Response {
    const headers = getSecurityHeaders()

    for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value)
    }

    return response
}
