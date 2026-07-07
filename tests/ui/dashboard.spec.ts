import { test, expect } from '@playwright/test';

test.describe('Dashboard UI @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the overview page correctly', async ({ page }) => {
    // The sidebar logo text is always visible
    await expect(page.getByText('Antigravity')).toBeVisible();

    // Sidebar nav items — use the nav link role to avoid strict mode violation
    // (both a nav link and an h1 heading have "Overview" text)
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Feedback Loop' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Team Rules' })).toBeVisible();
  });

  test('should navigate between pages using sidebar @regression', async ({ page }) => {
    // Navigate to Feedback Loop
    await page.click('text=Feedback Loop');
    await expect(page).toHaveURL('/feedback');
    // FeedbackLoop has a "Status" filter label (always visible as a <label>)
    await expect(page.getByText('Status', { exact: true })).toBeVisible();

    // Navigate to Team Rules
    await page.click('text=Team Rules');
    await expect(page).toHaveURL('/rules');
    // TeamRules page shows a "Filter by Org ID" label
    await expect(page.getByText('Filter by Org ID')).toBeVisible();

    // Navigate to Billing
    await page.getByRole('link', { name: 'Billing & Quota' }).click();
    await expect(page).toHaveURL('/billing');

    // Navigate to Audit Logs
    await page.getByRole('link', { name: 'Audit Logs' }).click();
    await expect(page).toHaveURL('/audit');
  });
});
