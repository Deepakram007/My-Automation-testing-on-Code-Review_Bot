import { test, expect } from '@playwright/test';

test.describe('Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the overview page correctly', async ({ page }) => {
    // Check page title or main heading
    await expect(page.getByText('Code Review Bot', { exact: false })).toBeVisible();
    
    // Check metric cards are present
    await expect(page.getByText('Total Reviews')).toBeVisible();
    await expect(page.getByText('Accuracy Rate')).toBeVisible();
    await expect(page.getByText('Approved')).toBeVisible();
    await expect(page.getByText('Rejected')).toBeVisible();
    
    // Check bottom panels
    await expect(page.getByText('Repository Breakdown')).toBeVisible();
    await expect(page.getByText('Recent Feedback')).toBeVisible();
  });

  test('should navigate between pages using sidebar', async ({ page }) => {
    // Navigate to Feedback Loop
    await page.click('text=Feedback Loop');
    await expect(page.url()).toContain('/feedback');
    await expect(page.getByText('Review Feedback')).toBeVisible(); // or some known text

    // Navigate to Team Rules
    await page.click('text=Team Rules');
    await expect(page.url()).toContain('/rules');

    // Navigate to Billing
    await page.click('text=Billing & Usage');
    await expect(page.url()).toContain('/billing');

    // Navigate to Audit Logs
    await page.click('text=Audit Logs');
    await expect(page.url()).toContain('/audit');
  });
});
