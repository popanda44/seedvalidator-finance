/**
 * FinYeld AI - Encryption Module Tests
 * Testing AES-256-GCM encryption, password hashing, and security utilities
 */

import {
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

describe('Encryption Module', () => {
    describe('encrypt/decrypt', () => {
        it('should encrypt and decrypt a string correctly', () => {
            const plaintext = 'sensitive-data-12345'
            const encrypted = encrypt(plaintext)
            const decrypted = decrypt(encrypted)

            expect(encrypted).not.toBe(plaintext)
            expect(decrypted).toBe(plaintext)
        })

        it('should produce different ciphertext for same plaintext (random IV)', () => {
            const plaintext = 'test-data'
            const encrypted1 = encrypt(plaintext)
            const encrypted2 = encrypt(plaintext)

            expect(encrypted1).not.toBe(encrypted2)
        })

        it('should handle empty strings', () => {
            expect(encrypt('')).toBe('')
            expect(decrypt('')).toBe('')
        })

        it('should handle unicode characters', () => {
            const plaintext = '敏感数据 🔐 données sensibles'
            const encrypted = encrypt(plaintext)
            const decrypted = decrypt(encrypted)

            expect(decrypted).toBe(plaintext)
        })

        it('should handle long strings', () => {
            const plaintext = 'x'.repeat(10000)
            const encrypted = encrypt(plaintext)
            const decrypted = decrypt(encrypted)

            expect(decrypted).toBe(plaintext)
        })
    })

    describe('hashPassword/verifyPassword', () => {
        it('should hash password and verify correctly', () => {
            const password = 'SecureP@ssw0rd!'
            const hash = hashPassword(password)

            expect(hash).not.toBe(password)
            expect(hash).toContain(':') // salt:hash format
            expect(verifyPassword(password, hash)).toBe(true)
        })

        it('should reject wrong password', () => {
            const password = 'correct-password'
            const hash = hashPassword(password)

            expect(verifyPassword('wrong-password', hash)).toBe(false)
        })

        it('should produce different hashes for same password (random salt)', () => {
            const password = 'same-password'
            const hash1 = hashPassword(password)
            const hash2 = hashPassword(password)

            expect(hash1).not.toBe(hash2)
        })

        it('should handle special characters in password', () => {
            const password = '!@#$%^&*()_+-=[]{}|;:,.<>?`~'
            const hash = hashPassword(password)

            expect(verifyPassword(password, hash)).toBe(true)
        })
    })

    describe('generateSecureToken', () => {
        it('should generate token with default length', () => {
            const token = generateSecureToken()
            expect(token.length).toBe(64) // 32 bytes = 64 hex chars
        })

        it('should generate token with custom length', () => {
            const token = generateSecureToken(16)
            expect(token.length).toBe(32) // 16 bytes = 32 hex chars
        })

        it('should generate unique tokens', () => {
            const tokens = new Set<string>()
            for (let i = 0; i < 100; i++) {
                tokens.add(generateSecureToken())
            }
            expect(tokens.size).toBe(100)
        })
    })

    describe('generateApiKey', () => {
        it('should generate API key with correct prefix', () => {
            const apiKey = generateApiKey()
            expect(apiKey.startsWith('fyk_')).toBe(true)
        })

        it('should generate unique API keys', () => {
            const keys = new Set<string>()
            for (let i = 0; i < 100; i++) {
                keys.add(generateApiKey())
            }
            expect(keys.size).toBe(100)
        })
    })

    describe('hashApiKey', () => {
        it('should hash API key consistently', () => {
            const apiKey = 'fyk_test123456789'
            const hash1 = hashApiKey(apiKey)
            const hash2 = hashApiKey(apiKey)

            expect(hash1).toBe(hash2)
        })

        it('should produce different hashes for different keys', () => {
            const hash1 = hashApiKey('fyk_key1')
            const hash2 = hashApiKey('fyk_key2')

            expect(hash1).not.toBe(hash2)
        })
    })

    describe('HMAC signatures', () => {
        it('should create and verify HMAC signature', () => {
            const payload = '{"event": "test", "data": "value"}'
            const secret = 'webhook-secret-key'

            const signature = createHmacSignature(payload, secret)
            const isValid = verifyHmacSignature(payload, signature, secret)

            expect(isValid).toBe(true)
        })

        it('should reject invalid signature', () => {
            const payload = '{"event": "test"}'
            const secret = 'secret-key'

            const isValid = verifyHmacSignature(payload, 'invalid-signature', secret)
            expect(isValid).toBe(false)
        })

        it('should reject tampered payload', () => {
            const originalPayload = '{"amount": 100}'
            const tamperedPayload = '{"amount": 1000}'
            const secret = 'secret'

            const signature = createHmacSignature(originalPayload, secret)
            const isValid = verifyHmacSignature(tamperedPayload, signature, secret)

            expect(isValid).toBe(false)
        })
    })

    describe('maskSensitiveData', () => {
        it('should mask sensitive data correctly', () => {
            const data = 'sk-1234567890abcdef'
            const masked = maskSensitiveData(data)

            expect(masked.startsWith('sk-1')).toBe(true)
            expect(masked.endsWith('cdef')).toBe(true)
            expect(masked).toContain('*')
        })

        it('should handle short strings', () => {
            expect(maskSensitiveData('abc')).toBe('***')
            expect(maskSensitiveData('')).toBe('***')
        })

        it('should respect custom visible chars', () => {
            const data = '1234567890'
            const masked = maskSensitiveData(data, 2)

            expect(masked.startsWith('12')).toBe(true)
            expect(masked.endsWith('90')).toBe(true)
        })
    })

    describe('encryptFields/decryptFields', () => {
        it('should encrypt and decrypt object fields', () => {
            const obj = {
                name: 'Test User',
                accessToken: 'secret-token-123',
                refreshToken: 'refresh-token-456',
                publicData: 'not-encrypted',
            }

            const encrypted = encryptFields(obj, ['accessToken', 'refreshToken'])

            expect(encrypted.name).toBe(obj.name)
            expect(encrypted.publicData).toBe(obj.publicData)
            expect(encrypted.accessToken).not.toBe(obj.accessToken)
            expect(encrypted.refreshToken).not.toBe(obj.refreshToken)

            const decrypted = decryptFields(encrypted, ['accessToken', 'refreshToken'])

            expect(decrypted.accessToken).toBe(obj.accessToken)
            expect(decrypted.refreshToken).toBe(obj.refreshToken)
        })
    })
})
