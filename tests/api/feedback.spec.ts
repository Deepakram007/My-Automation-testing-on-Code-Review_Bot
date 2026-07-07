import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Feedback Endpoints', () => {
  test('GET /api/feedback/stats should return summary and repositories structure', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/feedback/stats`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('summary');
    expect(body.summary).toHaveProperty('totalReviewsGenerated');
    expect(body.summary).toHaveProperty('approved');
    expect(body.summary).toHaveProperty('rejected');
    expect(body.summary).toHaveProperty('pending');
    expect(body.summary).toHaveProperty('accuracyRatePercentage');
    
    expect(body).toHaveProperty('repositories');
    expect(Array.isArray(body.repositories)).toBeTruthy();
  });

  test('GET /api/feedback/history should return paginated history', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/feedback/history?page=1&limit=5`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page', 1);
    expect(body).toHaveProperty('limit', 5);
    expect(body).toHaveProperty('totalPages');
    expect(body).toHaveProperty('history');
    expect(Array.isArray(body.history)).toBeTruthy();
  });
});
