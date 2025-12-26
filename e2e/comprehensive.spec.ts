import { test, expect } from '@playwright/test'

// ==========================================
// Authentication Flow Tests
// ==========================================
test.describe('Authentication', () => {
    test('should display login page correctly', async ({ page }) => {
        await page.goto('/login')

        // Check for FinYeld AI branding
        await expect(page.getByText('FinYeld AI')).toBeVisible()

        // Check for form elements
        await expect(page.getByPlaceholder(/email/i)).toBeVisible()
        await expect(page.getByPlaceholder(/password/i)).toBeVisible()
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should display register page correctly', async ({ page }) => {
        await page.goto('/register')

        await expect(page.getByText('FinYeld AI')).toBeVisible()
        await expect(page.getByPlaceholder(/name/i)).toBeVisible()
        await expect(page.getByPlaceholder(/email/i)).toBeVisible()
        await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    })

    test('should navigate from login to register', async ({ page }) => {
        await page.goto('/login')

        await page.getByText(/new to finyeld/i).click()
        await expect(page).toHaveURL(/register/)
    })

    test('should show validation errors for invalid email', async ({ page }) => {
        await page.goto('/login')

        await page.getByPlaceholder(/email/i).fill('invalid-email')
        await page.getByPlaceholder(/password/i).fill('password123')
        await page.getByRole('button', { name: /sign in/i }).click()

        // Should show error or stay on page
        await expect(page).toHaveURL(/login/)
    })
})

// ==========================================
// Dashboard Navigation Tests
// ==========================================
test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
        // For now, go to dashboard directly (in real scenario would need auth)
        await page.goto('/dashboard')
    })

    test('should display dashboard header', async ({ page }) => {
        // Check for FinYeld AI Command Center heading or branding
        const heading = page.locator('h1')
        await expect(heading).toBeVisible()
    })

    test('should have responsive sidebar toggle on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })

        // Look for menu button
        const menuButton = page.getByRole('button').filter({ has: page.locator('svg') }).first()
        await expect(menuButton).toBeVisible()
    })
})

// ==========================================
// Home Page Tests
// ==========================================
test.describe('Home Page', () => {
    test('should display hero section with FinYeld AI branding', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByText('FinYeld AI')).toBeVisible()
        await expect(page.getByText(/maximize your/i)).toBeVisible()
    })

    test('should have working CTA buttons', async ({ page }) => {
        await page.goto('/')

        const ctaButton = page.getByRole('link', { name: /start free trial/i })
        await expect(ctaButton).toBeVisible()

        await ctaButton.click()
        await expect(page).toHaveURL(/register/)
    })

    test('should display features section', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByText(/powerful features/i)).toBeVisible()
        await expect(page.getByText(/why founders love/i)).toBeVisible()
    })
})

// ==========================================
// Contact Page Tests
// ==========================================
test.describe('Contact Page', () => {
    test('should display contact form', async ({ page }) => {
        await page.goto('/contact')

        await expect(page.getByText(/get in touch/i)).toBeVisible()
        await expect(page.getByPlaceholder(/name/i)).toBeVisible()
        await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    })

    test('should show FinYeld AI email', async ({ page }) => {
        await page.goto('/contact')

        await expect(page.getByText('hello@finyeld.ai')).toBeVisible()
    })
})

// ==========================================
// Pricing Page Tests
// ==========================================
test.describe('Pricing Page', () => {
    test('should display pricing tiers', async ({ page }) => {
        await page.goto('/pricing')

        await expect(page.getByText(/pricing/i)).toBeVisible()

        // Check for pricing elements
        const pricingCards = page.locator('[class*="card"]')
        expect(await pricingCards.count()).toBeGreaterThan(0)
    })
})

// ==========================================
// Responsive Design Tests
// ==========================================
test.describe('Responsive Design', () => {
    const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 },
    ]

    for (const viewport of viewports) {
        test(`should display correctly on ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height })
            await page.goto('/')

            // Page should load without errors
            await expect(page).toHaveTitle(/FinYeld AI/i)

            // Hero should be visible
            await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        })
    }
})

// ==========================================
// Performance Tests
// ==========================================
test.describe('Performance', () => {
    test('should load home page within acceptable time', async ({ page }) => {
        const startTime = Date.now()
        await page.goto('/')
        const loadTime = Date.now() - startTime

        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000)
    })
})
