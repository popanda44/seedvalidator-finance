import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/SeedValidator/);
});

test('get started link', async ({ page }) => {
    await page.goto('/');

    // Click the get started link.
    await page.getByRole('link', { name: /Get Started/i }).first().click();

    // Expects page to have a heading with the name of Installation.
    // This depends on where your button goes, e.g., register page
    await expect(page).toHaveURL(/.*register/);
});
