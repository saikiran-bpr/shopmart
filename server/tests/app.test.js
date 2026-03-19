const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');

const testDataFilePath = path.join(
  os.tmpdir(),
  `shopsmart-app-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
);

const seedProducts = [
  {
    id: 'p-1001',
    name: 'Basmati Rice 5kg',
    category: 'Grocery',
    price: 12.99,
    stock: 24,
    createdAt: '2026-03-18T08:00:00.000Z',
    updatedAt: '2026-03-18T08:00:00.000Z'
  },
  {
    id: 'p-1002',
    name: 'Almond Milk 1L',
    category: 'Dairy',
    price: 3.49,
    stock: 18,
    createdAt: '2026-03-18T08:00:00.000Z',
    updatedAt: '2026-03-18T08:00:00.000Z'
  }
];

async function resetProducts() {
  await fs.writeFile(testDataFilePath, JSON.stringify(seedProducts, null, 2));
}

describe('Express App', () => {
  beforeAll(() => {
    process.env.PRODUCTS_DATA_FILE = testDataFilePath;
  });

  beforeEach(async () => {
    await resetProducts();
  });

  afterAll(async () => {
    delete process.env.PRODUCTS_DATA_FILE;
    await fs.rm(testDataFilePath, { force: true });
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('service');
    });
  });

  describe('GET /api/dashboard', () => {
    it('should return inventory summary', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.statusCode).toBe(200);
      expect(res.body.totalProducts).toBe(2);
      expect(res.body.totalUnitsInStock).toBe(42);
      expect(res.body.totalInventoryValue).toBeCloseTo(374.58, 2);
    });
  });

  describe('Products CRUD', () => {
    it('should list products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
      expect(Array.isArray(res.body.products)).toBe(true);
    });

    it('should create a new product', async () => {
      const payload = {
        name: 'Green Tea Pack',
        category: 'Beverages',
        price: 5.2,
        stock: 14
      };

      const res = await request(app).post('/api/products').send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(payload.name);
      expect(res.body).toHaveProperty('id');
    });

    it('should validate create payload', async () => {
      const res = await request(app).post('/api/products').send({
        name: '',
        category: '',
        price: -10,
        stock: -1
      });

      expect(res.statusCode).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should update existing product', async () => {
      const res = await request(app).put('/api/products/p-1001').send({
        name: 'Basmati Rice 10kg',
        category: 'Grocery',
        price: 21.5,
        stock: 12
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Basmati Rice 10kg');
      expect(res.body.stock).toBe(12);
    });

    it('should patch stock by delta', async () => {
      const res = await request(app).patch('/api/products/p-1002/stock').send({ delta: -3 });

      expect(res.statusCode).toBe(200);
      expect(res.body.stock).toBe(15);
    });

    it('should delete product', async () => {
      const res = await request(app).delete('/api/products/p-1001');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Product deleted');

      const list = await request(app).get('/api/products');
      expect(list.body.count).toBe(1);
    });

    it('should return 404 for unknown product', async () => {
      const res = await request(app).get('/api/products/not-found');
      expect(res.statusCode).toBe(404);
    });
  });
});
