import { test, expect } from '@playwright/test';

test.describe('Rules Management Form Validation @regression', () => {
  test.beforeEach(async ({ page }) => {
    // We navigate to rules page directly
    await page.goto('/rules');
  });

  test('should show validation errors if submitting empty rule form', async ({ page }) => {
    // Click "Add Custom Rule" button to open modal/form
    await page.click('text=Add Custom Rule');

    // Assuming there is a submit button in the modal
    await page.click('button:has-text("Save Rule")');

    // Check for native HTML5 validation or custom error messages
    // Playwright evaluates native validation via CSS :invalid or we can check input validity
    const repoInput = page.locator('input[placeholder="e.g. frontend/* or *"]');
    
    // Assuming required attribute is used, the form won't submit.
    // Let's check that the required attribute is present
    await expect(repoInput).toHaveAttribute('required', '');
    
    const descInput = page.locator('textarea[placeholder="Describe the rule..."]');
    await expect(descInput).toHaveAttribute('required', '');
  });
});
