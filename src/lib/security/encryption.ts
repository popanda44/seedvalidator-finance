/**
 * FinYeld AI - Encryption Utilities
 * AES-256-GCM encryption for sensitive data at rest
 */

import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 64 // 512 bits
const KEY_LENGTH = 32 // 256 bits
const PBKDF2_ITERATIONS = 100000

// Get encryption key from environment
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET

    if (!key) {
        console.warn('ENCRYPTION_KEY not set, using fallback (not secure for production)')
        return crypto.scryptSync('default-dev-key', 'salt', KEY_LENGTH)
    }

    // If key is hex-encoded (64 chars = 32 bytes)
    if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
        return Buffer.from(key, 'hex')
    }

    // Derive key from passphrase
    return crypto.scryptSync(key, 'finyeld-ai-salt', KEY_LENGTH)
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns base64-encoded ciphertext with IV and auth tag prepended
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) return plaintext

    try {
        const key = getEncryptionKey()
        const iv = crypto.randomBytes(IV_LENGTH)

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

        let encrypted = cipher.update(plaintext, 'utf8', 'base64')
        encrypted += cipher.final('base64')

        const authTag = cipher.getAuthTag()

        // Combine IV + AuthTag + Ciphertext
        const combined = Buffer.concat([
            iv,
            authTag,
            Buffer.from(encrypted, 'base64'),
        ])

        return combined.toString('base64')
    } catch (error) {
        console.error('Encryption error:', error)
        throw new Error('Failed to encrypt data')
    }
}

/**
 * Decrypt a base64-encoded ciphertext
 */
export function decrypt(ciphertext: string): string {
    if (!ciphertext) return ciphertext

    try {
        const key = getEncryptionKey()
        const combined = Buffer.from(ciphertext, 'base64')

        // Extract IV, AuthTag, and Ciphertext
        const iv = combined.subarray(0, IV_LENGTH)
        const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
        const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        decipher.setAuthTag(authTag)

        let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    } catch (error) {
        console.error('Decryption error:', error)
        throw new Error('Failed to decrypt data')
    }
}

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')

    // Combine salt and hash
    return salt.toString('hex') + ':' + hash.toString('hex')
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    try {
        const [saltHex, hashHex] = storedHash.split(':')
        const salt = Buffer.from(saltHex, 'hex')
        const storedHashBuffer = Buffer.from(hashHex, 'hex')

        const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')

        return crypto.timingSafeEqual(hash, storedHashBuffer)
    } catch {
        return false
    }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
    const prefix = 'fyk_' // FinYeld Key
    const key = crypto.randomBytes(24).toString('base64url')
    return prefix + key
}

/**
 * Hash an API key for storage (one-way)
 */
export function hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Create a HMAC signature for webhook verification
 */
export function createHmacSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Verify a HMAC signature
 */
export function verifyHmacSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = createHmacSignature(payload, secret)

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        )
    } catch {
        return false
    }
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars * 2) {
        return '***'
    }

    const start = data.substring(0, visibleChars)
    const end = data.substring(data.length - visibleChars)
    const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 10))

    return `${start}${masked}${end}`
}

/**
 * Encrypt sensitive object fields
 */
export function encryptFields<T extends Record<string, unknown>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[]
): T {
    const result = { ...obj }

    for (const field of fieldsToEncrypt) {
        if (typeof result[field] === 'string') {
            result[field] = encrypt(result[field] as string) as T[keyof T]
        }
    }

    return result
}

/**
 * Decrypt sensitive object fields
 */
export function decryptFields<T extends Record<string, unknown>>(
    obj: T,
    fieldsToDecrypt: (keyof T)[]
): T {
    const result = { ...obj }

    for (const field of fieldsToDecrypt) {
        if (typeof result[field] === 'string') {
            try {
                result[field] = decrypt(result[field] as string) as T[keyof T]
            } catch {
                // Field might not be encrypted, leave as-is
            }
        }
    }

    return result
}
