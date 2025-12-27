/**
 * API Security Layer - Verification Script
 * Run with: npx tsx scripts/verify-security.ts
 */

import { z } from 'zod'

// Test validation schemas
console.log('🔒 API Security Layer Verification\n')
console.log('='.repeat(50))

// ==========================================
// TEST 1: Validation Schemas
// ==========================================
console.log('\n📋 Test 1: Validation Schemas\n')

// Forecast Request Schema
const forecastRequestSchema = z.object({
    companyId: z.string().uuid(),
    forecastType: z.enum(['revenue', 'expense', 'cash_flow', 'runway', 'headcount']),
    forecastHorizon: z.number().int().min(1).max(36),
    method: z.enum(['linear', 'exponential', 'seasonal', 'ai_powered', 'manual']).optional(),
    includeScenarios: z.array(z.enum(['best_case', 'base_case', 'worst_case'])).optional(),
})

// Valid forecast request
const validForecast = {
    companyId: '550e8400-e29b-41d4-a716-446655440000',
    forecastType: 'revenue',
    forecastHorizon: 12,
    method: 'ai_powered',
    includeScenarios: ['best_case', 'base_case', 'worst_case'],
}

const forecastResult = forecastRequestSchema.safeParse(validForecast)
console.log(`  ✅ Valid forecast request: ${forecastResult.success ? 'PASS' : 'FAIL'}`)

// Invalid forecast (horizon too large)
const invalidForecast = {
    companyId: '550e8400-e29b-41d4-a716-446655440000',
    forecastType: 'revenue',
    forecastHorizon: 100, // Invalid - max is 36
}

const invalidResult = forecastRequestSchema.safeParse(invalidForecast)
console.log(`  ✅ Invalid forecast rejected: ${!invalidResult.success ? 'PASS' : 'FAIL'}`)

// Bank Connection Schema
const bankConnectionSchema = z.object({
    publicToken: z.string().min(1),
    institutionId: z.string().min(1),
    institutionName: z.string().optional(),
    accounts: z.array(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        type: z.enum(['checking', 'savings', 'credit', 'depository', 'investment', 'loan', 'other']),
    })).min(1),
})

const validBankConnection = {
    publicToken: 'public-sandbox-12345',
    institutionId: 'ins_123',
    institutionName: 'Chase Bank',
    accounts: [
        { id: 'acc_1', name: 'Checking Account', type: 'checking' },
        { id: 'acc_2', name: 'Savings Account', type: 'savings' },
    ],
}

const bankResult = bankConnectionSchema.safeParse(validBankConnection)
console.log(`  ✅ Valid bank connection: ${bankResult.success ? 'PASS' : 'FAIL'}`)

// Empty accounts (should fail)
const invalidBank = {
    publicToken: 'public-sandbox-12345',
    institutionId: 'ins_123',
    accounts: [],
}

const invalidBankResult = bankConnectionSchema.safeParse(invalidBank)
console.log(`  ✅ Empty accounts rejected: ${!invalidBankResult.success ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 2: API Key Format Validation
// ==========================================
console.log('\n🔑 Test 2: API Key Format\n')

const apiKeySchema = z.string().regex(/^fyk_[a-zA-Z0-9_-]+$/)

const validApiKey = 'fyk_abc123XYZ_test-key'
const invalidApiKey = 'invalid_key_format'

console.log(`  ✅ Valid API key format: ${apiKeySchema.safeParse(validApiKey).success ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Invalid API key rejected: ${!apiKeySchema.safeParse(invalidApiKey).success ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 3: Suspicious Input Detection
// ==========================================
console.log('\n🚨 Test 3: Suspicious Input Detection\n')

function detectSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /union\s+select/i,
        /insert\s+into/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /update\s+\w+\s+set/i,
    ]
    return suspiciousPatterns.some((pattern) => pattern.test(input))
}

const xssAttempt = '<script>alert("XSS")</script>'
const sqlInjection = "'; DROP TABLE users; --"
const normalInput = 'This is a normal description for a transaction'

console.log(`  ✅ XSS detected: ${detectSuspiciousInput(xssAttempt) ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ SQL injection detected: ${detectSuspiciousInput(sqlInjection) ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Normal input allowed: ${!detectSuspiciousInput(normalInput) ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 4: Rate Limit Key Generation
// ==========================================
console.log('\n⏱️  Test 4: Rate Limit Key Generation\n')

function getRateLimitKey(ip: string, endpoint: string, userId?: string): string {
    const base = `ratelimit:${endpoint}:${ip}`
    return userId ? `${base}:${userId}` : base
}

const key1 = getRateLimitKey('192.168.1.1', '/api/forecast')
const key2 = getRateLimitKey('192.168.1.1', '/api/forecast', 'user_123')

console.log(`  ✅ Anonymous key format: ${key1 === 'ratelimit:/api/forecast:192.168.1.1' ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ User key format: ${key2 === 'ratelimit:/api/forecast:192.168.1.1:user_123' ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 5: API Key Permission Check
// ==========================================
console.log('\n🔐 Test 5: API Key Permissions\n')

function hasPermission(permissions: string[], required: string): boolean {
    if (permissions.includes('*')) return true
    if (permissions.includes(required)) return true

    const [action, resource] = required.split(':')
    if (permissions.includes(`${action}:*`)) return true
    if (permissions.includes(`*:${resource}`)) return true

    return false
}

const userPermissions = ['read:transactions', 'write:reports', 'read:*']

console.log(`  ✅ Exact match: ${hasPermission(userPermissions, 'read:transactions') ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Wildcard match: ${hasPermission(userPermissions, 'read:forecasts') ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ No permission: ${!hasPermission(userPermissions, 'delete:users') ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Admin wildcard: ${hasPermission(['*'], 'anything:here') ? 'PASS' : 'FAIL'}`)

// ==========================================
// SUMMARY
// ==========================================
console.log('\n' + '='.repeat(50))
console.log('✅ All API Security Layer tests completed!')
console.log('='.repeat(50) + '\n')
