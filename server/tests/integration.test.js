const request = require('supertest');
const app = require('../src/app');

describe('Integration Tests', () => {
  describe('API Health and Status Flow', () => {
    it('should allow client to check health status', async () => {
      // Step 1: Client checks if API is healthy
      const healthRes = await request(app).get('/api/health');
      expect(healthRes.statusCode).toEqual(200);
      expect(healthRes.body.status).toBe('ok');

      // Step 2: Client can access root endpoint
      const rootRes = await request(app).get('/');
      expect(rootRes.statusCode).toEqual(200);

      // Step 3: Both endpoints are accessible and working
      expect(healthRes.body).toHaveProperty('timestamp');
      expect(typeof rootRes.text).toBe('string');
    });
  });

  describe('Cross-Origin Request Handling', () => {
    it('should handle preflight CORS requests', async () => {
      const res = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect([200, 204]).toContain(res.statusCode);
    });

    it('should accept requests from different origins', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://example.com');

      expect(res.statusCode).toEqual(200);
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Request-Response Cycle', () => {
    it('should handle multiple consecutive requests', async () => {
      const res1 = await request(app).get('/api/health');
      const res2 = await request(app).get('/api/health');
      const res3 = await request(app).get('/');

      expect(res1.statusCode).toEqual(200);
      expect(res2.statusCode).toEqual(200);
      expect(res3.statusCode).toEqual(200);
    });
  });
});
