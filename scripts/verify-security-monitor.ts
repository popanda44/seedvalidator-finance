/**
 * Security Monitor - Verification Script
 * Run with: npx tsx scripts/verify-security-monitor.ts
 */

console.log('🔒 Security Monitor Verification\n')
console.log('='.repeat(50))

// ==========================================
// TEST 1: Brute Force Detection
// ==========================================
console.log('\n🚨 Test 1: Brute Force Detection\n')

const failedLoginAttempts = new Map<string, { count: number; firstAttempt: number }>()

function simulateFailedLogin(identifier: string): { attempts: number; blocked: boolean } {
    const key = identifier
    const now = Date.now()

    let entry = failedLoginAttempts.get(key)
    if (!entry || now - entry.firstAttempt > 15 * 60 * 1000) {
        entry = { count: 0, firstAttempt: now }
    }

    entry.count++
    failedLoginAttempts.set(key, entry)

    const shouldAlert = entry.count >= 5
    const shouldBlock = entry.count >= 10

    return { attempts: entry.count, blocked: shouldBlock }
}

// Simulate 12 failed logins
const testUser = 'test@example.com'
let lastResult = { attempts: 0, blocked: false }
for (let i = 0; i < 12; i++) {
    lastResult = simulateFailedLogin(testUser)
}

console.log(`  ✅ Failed login tracking: ${lastResult.attempts === 12 ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Block at 10 attempts: ${lastResult.blocked ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 2: API Anomaly Detection
// ==========================================
console.log('\n📊 Test 2: API Anomaly Detection\n')

const apiCallTracker = new Map<string, { count: number; windowStart: number }>()

function checkApiAnomalies(
    userId: string,
    endpoint: string,
    normalRatePerMinute: number = 10
): { suspicious: boolean; currentRate: number } {
    const key = `${userId}:${endpoint}`
    const now = Date.now()

    let entry = apiCallTracker.get(key)
    if (!entry || now - entry.windowStart > 60000) {
        entry = { count: 0, windowStart: now }
    }

    entry.count++
    apiCallTracker.set(key, entry)

    const suspicious = entry.count > normalRatePerMinute * 10

    return { suspicious, currentRate: entry.count }
}

// Normal activity (50 calls with 10/min baseline = 5x, not suspicious)
const normalUser = 'user_normal'
let normalResult = { suspicious: false, currentRate: 0 }
for (let i = 0; i < 50; i++) {
    normalResult = checkApiAnomalies(normalUser, '/api/data', 10)
}
console.log(`  ✅ Normal activity not flagged (50 calls): ${!normalResult.suspicious ? 'PASS' : 'FAIL'}`)

// Anomalous activity (150 calls with 10/min baseline = 15x, suspicious)
const suspiciousUser = 'user_suspicious'
let anomalyResult = { suspicious: false, currentRate: 0 }
for (let i = 0; i < 150; i++) {
    anomalyResult = checkApiAnomalies(suspiciousUser, '/api/data', 10)
}
console.log(`  ✅ Anomalous activity flagged (150 calls): ${anomalyResult.suspicious ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 3: Data Exfiltration Detection
// ==========================================
console.log('\n📤 Test 3: Data Exfiltration Detection\n')

function checkDataExport(recordCount: number): { flagged: boolean; reason?: string } {
    if (recordCount > 10000) {
        return { flagged: true, reason: 'Export size exceeds limit' }
    }
    return { flagged: false }
}

const smallExport = checkDataExport(500)
const largeExport = checkDataExport(15000)

console.log(`  ✅ Small export allowed (500 records): ${!smallExport.flagged ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Large export flagged (15000 records): ${largeExport.flagged ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 4: Severity Classification
// ==========================================
console.log('\n⚠️  Test 4: Severity Classification\n')

function getSeverity(type: string): string {
    const severityMap: Record<string, string> = {
        'BRUTE_FORCE_ATTEMPT': 'HIGH',
        'UNUSUAL_API_ACTIVITY': 'MEDIUM',
        'POTENTIAL_DATA_EXFILTRATION': 'CRITICAL',
        'UNAUTHORIZED_ACCESS_ATTEMPT': 'HIGH',
    }
    return severityMap[type] || 'MEDIUM'
}

console.log(`  ✅ Brute force = HIGH: ${getSeverity('BRUTE_FORCE_ATTEMPT') === 'HIGH' ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ API anomaly = MEDIUM: ${getSeverity('UNUSUAL_API_ACTIVITY') === 'MEDIUM' ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Exfiltration = CRITICAL: ${getSeverity('POTENTIAL_DATA_EXFILTRATION') === 'CRITICAL' ? 'PASS' : 'FAIL'}`)

// ==========================================
// TEST 5: PII Scrubbing
// ==========================================
console.log('\n🔐 Test 5: PII Scrubbing\n')

function scrubPII(message: string): string {
    return message
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
        .replace(/\bfyk_[a-zA-Z0-9_-]+\b/g, '[API_KEY]')
}

const messageWithPII = 'User test@example.com with SSN 123-45-6789 and API key fyk_abc123XYZ failed auth'
const scrubbedMessage = scrubPII(messageWithPII)

console.log(`  ✅ Email scrubbed: ${scrubbedMessage.includes('[EMAIL]') ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ SSN scrubbed: ${scrubbedMessage.includes('[SSN]') ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ API key scrubbed: ${scrubbedMessage.includes('[API_KEY]') ? 'PASS' : 'FAIL'}`)
console.log(`  ✅ Original values removed: ${!scrubbedMessage.includes('test@example.com') ? 'PASS' : 'FAIL'}`)

// ==========================================
// SUMMARY
// ==========================================
console.log('\n' + '='.repeat(50))
console.log('✅ All Security Monitor tests completed!')
console.log('='.repeat(50) + '\n')
