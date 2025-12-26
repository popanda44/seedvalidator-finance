/**
 * FinYeld AI - Security Module Index
 * Re-exports all security utilities
 */

// Encryption
export {
    encrypt,
    decrypt,
    hashPassword,
    verifyPassword,
    generateSecureToken,
    generateApiKey,
    hashApiKey,
    createHmacSignature,
    verifyHmacSignature,
    maskSensitiveData,
    encryptFields,
    decryptFields,
} from './encryption'

// Security Headers
export {
    getSecurityHeaders,
    getSecurityHeadersForNextConfig,
    getCORSHeaders,
    applySecurityHeaders,
    defaultCORSConfig,
    type SecurityHeadersConfig,
    type CORSConfig,
} from './headers'

// Input Validation
export {
    // Schemas
    emailSchema,
    passwordSchema,
    simplePasswordSchema,
    uuidSchema,
    urlSchema,
    safeStringSchema,
    companyNameSchema,
    amountSchema,
    dateRangeSchema,
    loginRequestSchema,
    registerRequestSchema,
    createTransactionSchema,
    expenseFilterSchema,
    apiKeySchema,
    webhookPayloadSchema,
    // Functions
    sanitizeHtml,
    escapeHtml,
    sanitizeForSql,
    sanitizeFileName,
    safeParseJSON,
    validateRequest,
    detectSuspiciousInput,
    getRateLimitKey,
    type ValidationResult,
} from './validation'

// Audit Logging
export {
    auditLog,
    type AuditEventType,
    type AuditSeverity,
    type AuditLogEntry,
} from './audit'

// RBAC - Role-Based Access Control
export {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleAtLeast,
    getRoutePermission,
    getAuthContext,
    requireAuth,
    requirePermission,
    requireRole,
    requireCompanyAccess,
    ROLE_PERMISSIONS,
    ROLE_HIERARCHY,
    ROUTE_PERMISSIONS,
    type UserRole,
    type Permission,
    type AuthContext,
} from './rbac'
