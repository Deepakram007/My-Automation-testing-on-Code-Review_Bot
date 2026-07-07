import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Rules Endpoints', () => {
  test('should fetch all rules for an organization', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/rules?organizationId=test-org-123`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('should fail to create a rule with missing data', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/rules`, {
      data: { repoPattern: '*' } // Missing ruleType and description
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('repoPattern, ruleType, and description are required.');
  });

  test('should fail to create a rule with invalid ruleType', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/rules`, {
      data: { repoPattern: '*', ruleType: 'INVALID', description: 'Test desc' }
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('ruleType must be one of:');
  });

  test('should return 404 when updating non-existent rule', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/rules/non-existent-id`, {
      data: { enabled: false }
    });
    expect(response.status()).toBe(404);
  });

  test('should return 404 when deleting non-existent rule', async ({ request }) => {
    const response = await request.delete(`${API_URL}/api/rules/non-existent-id`);
    expect(response.status()).toBe(404);
  });
});
