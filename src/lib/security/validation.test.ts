/**
 * FinYeld AI - Input Validation Tests
 * Testing Zod schemas and sanitization functions
 */

import {
    emailSchema,
    passwordSchema,
    uuidSchema,
    amountSchema,
    sanitizeHtml,
    escapeHtml,
    sanitizeFileName,
    validateRequest,
    detectSuspiciousInput,
    loginRequestSchema,
    registerRequestSchema,
    createTransactionSchema,
} from './validation'

describe('Validation Module', () => {
    describe('emailSchema', () => {
        it('should validate correct emails', () => {
            expect(emailSchema.parse('test@example.com')).toBe('test@example.com')
            expect(emailSchema.parse('USER@DOMAIN.COM')).toBe('user@domain.com') // lowercase
            expect(emailSchema.parse('  test@example.com  ')).toBe('test@example.com') // trimmed
        })

        it('should reject invalid emails', () => {
            expect(() => emailSchema.parse('invalid')).toThrow()
            expect(() => emailSchema.parse('no@domain')).toThrow()
            expect(() => emailSchema.parse('@nodomain.com')).toThrow()
        })
    })

    describe('passwordSchema', () => {
        it('should validate strong passwords', () => {
            expect(() => passwordSchema.parse('SecureP@ss1')).not.toThrow()
            expect(() => passwordSchema.parse('MyP@ssw0rd!')).not.toThrow()
        })

        it('should reject weak passwords', () => {
            // Too short
            expect(() => passwordSchema.parse('Short1!')).toThrow()

            // No uppercase
            expect(() => passwordSchema.parse('lowercase1!')).toThrow()

            // No lowercase
            expect(() => passwordSchema.parse('UPPERCASE1!')).toThrow()

            // No number
            expect(() => passwordSchema.parse('NoNumber!!')).toThrow()

            // No special char
            expect(() => passwordSchema.parse('NoSpecial1')).toThrow()
        })
    })

    describe('uuidSchema', () => {
        it('should validate correct UUIDs', () => {
            expect(() => uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow()
        })

        it('should reject invalid UUIDs', () => {
            expect(() => uuidSchema.parse('not-a-uuid')).toThrow()
            expect(() => uuidSchema.parse('123')).toThrow()
        })
    })

    describe('amountSchema', () => {
        it('should validate valid amounts', () => {
            expect(amountSchema.parse(0)).toBe(0)
            expect(amountSchema.parse(1000.50)).toBe(1000.50)
            expect(amountSchema.parse(-50000)).toBe(-50000)
        })

        it('should reject amounts outside range', () => {
            expect(() => amountSchema.parse(2000000000)).toThrow() // > 1 billion
            expect(() => amountSchema.parse(-2000000000)).toThrow() // < -1 billion
        })
    })

    describe('sanitizeHtml', () => {
        it('should remove script tags', () => {
            const input = '<script>alert("xss")</script>Hello'
            expect(sanitizeHtml(input)).toBe('Hello')
        })

        it('should remove HTML tags', () => {
            const input = '<div><b>Bold</b> text</div>'
            expect(sanitizeHtml(input)).toBe('Bold text')
        })

        it('should remove javascript: URLs', () => {
            const input = 'Click javascript:alert(1) here'
            expect(sanitizeHtml(input)).not.toContain('javascript:')
        })

        it('should remove onclick handlers', () => {
            const input = '<button onclick="steal()">Click</button>'
            expect(sanitizeHtml(input)).not.toContain('onclick')
        })
    })

    describe('escapeHtml', () => {
        it('should escape HTML entities', () => {
            expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
            expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
            expect(escapeHtml("it's")).toBe("it&#39;s")
        })
    })

    describe('sanitizeFileName', () => {
        it('should remove special characters', () => {
            expect(sanitizeFileName('file<>:"|?*.txt')).toBe('file________.txt')
        })

        it('should handle spaces', () => {
            expect(sanitizeFileName('my file.pdf')).toBe('my_file.pdf')
        })

        it('should limit length', () => {
            const longName = 'x'.repeat(500) + '.txt'
            expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255)
        })
    })

    describe('detectSuspiciousInput', () => {
        it('should detect SQL injection patterns', () => {
            expect(detectSuspiciousInput("'; DROP TABLE users;--")).toBe(true)
            expect(detectSuspiciousInput('1 UNION SELECT * FROM users')).toBe(true)
            expect(detectSuspiciousInput("' OR '1'='1")).toBe(true)
        })

        it('should detect XSS patterns', () => {
            expect(detectSuspiciousInput('<script>alert(1)</script>')).toBe(true)
            expect(detectSuspiciousInput('javascript:void(0)')).toBe(true)
            expect(detectSuspiciousInput('<img onerror="hack()">')).toBe(true)
        })

        it('should allow normal input', () => {
            expect(detectSuspiciousInput('Hello, world!')).toBe(false)
            expect(detectSuspiciousInput('user@example.com')).toBe(false)
            expect(detectSuspiciousInput('$1,234.56')).toBe(false)
        })
    })

    describe('validateRequest', () => {
        it('should validate login request', () => {
            const result = validateRequest(loginRequestSchema, {
                email: 'test@example.com',
                password: 'password123',
            })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.email).toBe('test@example.com')
            }
        })

        it('should return errors for invalid request', () => {
            const result = validateRequest(loginRequestSchema, {
                email: 'invalid',
                password: '',
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.errors.length).toBeGreaterThan(0)
            }
        })
    })

    describe('registerRequestSchema', () => {
        it('should validate registration data', () => {
            const result = validateRequest(registerRequestSchema, {
                email: 'new@user.com',
                password: 'SecureP@ss1',
                name: 'New User',
                companyName: 'Acme Inc',
            })

            expect(result.success).toBe(true)
        })

        it('should reject weak password in registration', () => {
            const result = validateRequest(registerRequestSchema, {
                email: 'new@user.com',
                password: 'weak',
                name: 'New User',
            })

            expect(result.success).toBe(false)
        })
    })

    describe('createTransactionSchema', () => {
        it('should validate transaction data', () => {
            const result = validateRequest(createTransactionSchema, {
                amount: 1500.00,
                name: 'Office Supplies',
                date: '2024-01-15',
            })

            expect(result.success).toBe(true)
        })
    })
})
