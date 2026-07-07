import { test, expect } from '@playwright/test';

test.describe('Rules Management Form Validation @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rules');
  });

  test('should show "Add Rule" button on the rules page', async ({ page }) => {
    // The TeamRules page has a button with text "Add Rule"
    const addBtn = page.getByRole('button', { name: /add rule/i });
    await expect(addBtn).toBeVisible();
  });

  test('should open the rule modal when Add Rule is clicked', async ({ page }) => {
    // Click the "Add Rule" button (contains Plus icon + "Add Rule" text)
    await page.getByRole('button', { name: /add rule/i }).first().click();

    // RuleModal should appear — it has a Save button and form fields
    // Wait for modal to open
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible({ timeout: 5000 });
  });
});
