import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Billing Endpoints', () => {
  const mockOrgId = 'test-org-123';

  test('should return 404 for non-existent organization usage', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/billing/usage/${mockOrgId}`);
    expect(response.status()).toBe(404);
    
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Organization not found');
  });

  test('should return 400 when updating tier without plan', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/billing/tier/${mockOrgId}`, {
      data: {}
    });
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Plan name is required.');
  });

  test('should return 400 for invalid plan tier', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/billing/tier/${mockOrgId}`, {
      data: { plan: 'INVALID_PLAN' }
    });
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body.error).toContain('Plan must be one of: FREE, PRO, ENTERPRISE');
  });
});
