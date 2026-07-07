import { test, expect } from '@playwright/test';

// Base URL for API calls is defined in playwright.config.ts as baseURL 
// but we might need a specific backend URL if the frontend and backend are split.
// In dev, frontend is on 5173, backend on 3000. We will hit the backend URL directly.
const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Health Endpoint', () => {
  test('should return 200 ok status', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body.services).toHaveProperty('database', 'connected');
    expect(body.services).toHaveProperty('redis', 'ready');
  });
});
