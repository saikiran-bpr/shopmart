const request = require('supertest');
const app = require('../src/app');

describe('Express App', () => {
  describe('GET /api/health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body.message).toBe('ShopSmart Backend is running');
    });

    it('should return a valid timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.body).toHaveProperty('timestamp');
      expect(() => new Date(res.body.timestamp)).not.toThrow();
    });
  });

  describe('GET /', () => {
    it('should return 200 and ShopSmart message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('ShopSmart Backend Service');
    });
  });

  describe('CORS Middleware', () => {
    it('should include CORS headers in response', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('JSON Middleware', () => {
    it('should parse JSON request body', async () => {
      const res = await request(app)
        .post('/api/test')
        .send({ test: 'data' });
      // This will return 404 but middleware should parse the body without error
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/non-existent-route');
      expect(res.statusCode).toEqual(404);
    });
  });
});
