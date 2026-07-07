import { test, expect } from '@playwright/test';

test.describe('Authentication Flow @smoke @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display error message on invalid credentials', async ({ page }) => {
    // Verify the login page loaded (has "Sign In" heading)
    await expect(page.getByText('Sign In')).toBeVisible();

    // Fill in the login form with wrong details
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'badpass');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify error message appears
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Fill in the correct details
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard (URL becomes /)
    await expect(page).toHaveURL('/');
    
    // Verify sidebar "Antigravity" logo text is visible (confirms dashboard loaded)
    await expect(page.getByText('Antigravity')).toBeVisible();

    // Check if the localStorage token was set
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBe('fake-jwt-token');
  });
});
