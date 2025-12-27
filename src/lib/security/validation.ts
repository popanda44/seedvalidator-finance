/**
 * FinYeld AI - Input Validation & Sanitization
 * Protection against injection attacks and malicious input
 */

import { z } from 'zod'

// ==========================================
// COMMON VALIDATORS
// ==========================================

/**
 * Email validation with strict rules
 */
export const emailSchema = z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .transform((email) => email.toLowerCase().trim())

/**
 * Password validation with strength requirements
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character')

/**
 * Weak password validation (for legacy systems)
 */
export const simplePasswordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long')

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid ID format')

/**
 * URL validation
 */
export const urlSchema = z
    .string()
    .url('Invalid URL')
    .max(2048, 'URL too long')

/**
 * Safe string - no HTML/script tags
 */
export const safeStringSchema = z
    .string()
    .max(10000, 'Text too long')
    .transform((str) => sanitizeHtml(str))

/**
 * Company name validation
 */
export const companyNameSchema = z
    .string()
    .min(1, 'Company name is required')
    .max(255, 'Company name too long')
    .transform((name) => name.trim())

/**
 * Amount validation (for financial data)
 */
export const amountSchema = z
    .number()
    .min(-1000000000, 'Amount too small')
    .max(1000000000, 'Amount too large')

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
}).refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before end date',
})

// ==========================================
// SANITIZATION FUNCTIONS
// ==========================================

/**
 * Remove HTML tags to prevent XSS
 */
export function sanitizeHtml(input: string): string {
    if (!input) return input

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim()
}

/**
 * Escape HTML entities
 */
export function escapeHtml(input: string): string {
    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    }

    return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char])
}

/**
 * Sanitize for SQL (additional layer on top of parameterized queries)
 */
export function sanitizeForSql(input: string): string {
    if (!input) return input

    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
    if (!fileName) return 'unnamed'

    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255)
}

/**
 * Validate and sanitize JSON
 */
export function safeParseJSON<T>(json: string): T | null {
    try {
        return JSON.parse(json) as T
    } catch {
        return null
    }
}

// ==========================================
// API REQUEST VALIDATORS
// ==========================================

/**
 * Login request validation
 */
export const loginRequestSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
})

/**
 * Registration request validation
 */
export const registerRequestSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    companyName: companyNameSchema.optional(),
})

/**
 * Transaction creation validation
 */
export const createTransactionSchema = z.object({
    amount: amountSchema,
    name: safeStringSchema.pipe(z.string().min(1, 'Description is required')),
    date: z.coerce.date(),
    categoryId: uuidSchema.optional(),
})

/**
 * Expense filter validation
 */
export const expenseFilterSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    categoryId: uuidSchema.optional(),
    minAmount: z.coerce.number().optional(),
    maxAmount: z.coerce.number().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
})

/**
 * API key validation
 */
export const apiKeySchema = z
    .string()
    .regex(/^fyk_[a-zA-Z0-9_-]+$/, 'Invalid API key format')

/**
 * Webhook payload validation
 */
export const webhookPayloadSchema = z.object({
    type: z.string(),
    timestamp: z.coerce.date().optional(),
    payload: z.record(z.unknown()),
})

// ==========================================
// FORECAST & INTEGRATION VALIDATORS
// ==========================================

/**
 * Forecast request validation
 */
export const forecastRequestSchema = z.object({
    companyId: uuidSchema,
    forecastType: z.enum(['revenue', 'expense', 'cash_flow', 'runway', 'headcount']),
    forecastHorizon: z.number().int().min(1).max(36),
    method: z.enum(['linear', 'exponential', 'seasonal', 'ai_powered', 'manual']).optional(),
    includeScenarios: z.array(z.enum(['best_case', 'base_case', 'worst_case'])).optional(),
    assumptions: z.record(z.unknown()).optional(),
})

/**
 * Bank connection validation (Plaid integration)
 */
export const bankConnectionSchema = z.object({
    publicToken: z.string().min(1, 'Public token is required'),
    institutionId: z.string().min(1, 'Institution ID is required'),
    institutionName: z.string().optional(),
    accounts: z.array(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        type: z.enum(['checking', 'savings', 'credit', 'depository', 'investment', 'loan', 'other']),
        mask: z.string().optional(),
    })).min(1, 'At least one account must be selected'),
})

/**
 * Transaction import validation (bulk import)
 */
export const transactionImportSchema = z.object({
    transactions: z.array(z.object({
        amount: amountSchema,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
        name: z.string().min(1).max(500),
        category: z.string().optional(),
        merchant: z.string().max(200).optional(),
        notes: z.string().max(1000).optional(),
    })).min(1).max(1000, 'Maximum 1000 transactions per import'),
    bankAccountId: uuidSchema,
    skipDuplicates: z.boolean().default(true),
})

/**
 * API key creation request
 */
export const createApiKeyRequestSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    permissions: z.array(z.string()).optional(),
    expiresInDays: z.number().int().min(1).max(365).optional(),
})

// ==========================================
// VALIDATION MIDDLEWARE HELPERS
// ==========================================

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; errors: string[] }

/**
 * Validate request body against schema
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): ValidationResult<T> {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
    )

    return { success: false, errors }
}

/**
 * Check for suspicious patterns in input
 */
export function detectSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /union\s+select/i,
        /insert\s+into/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /update\s+\w+\s+set/i,
        /exec\s*\(/i,
        /xp_cmdshell/i,
        /base64_decode/i,
        /eval\s*\(/i,
    ]

    return suspiciousPatterns.some((pattern) => pattern.test(input))
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(
    ip: string,
    endpoint: string,
    userId?: string
): string {
    const base = `ratelimit:${endpoint}:${ip}`
    return userId ? `${base}:${userId}` : base
}
