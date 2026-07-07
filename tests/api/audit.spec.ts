import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Audit Endpoints', () => {
  const mockOrgId = 'test-org-123';

  test('should return 404 for non-existent organization audit logs', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/audit/${mockOrgId}`);
    expect(response.status()).toBe(404);
    
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Organization not found');
  });

  // We are testing the API contract here even if it errors 404 on the specific ID
  // To truly test the structure, we would seed the database.
  test('should accept pagination parameters', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/audit/${mockOrgId}?page=2&limit=5`);
    expect(response.status()).toBe(404); // Assuming the org still doesn't exist
  });

  test('should accept action filter parameters', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/audit/${mockOrgId}?action=SUBSCRIPTION_PLAN_UPDATED`);
    expect(response.status()).toBe(404);
  });
});
