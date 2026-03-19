const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');

const testDataFilePath = path.join(
  os.tmpdir(),
  `shopsmart-integration-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
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

describe('Integration Tests', () => {
  beforeAll(() => {
    process.env.PRODUCTS_DATA_FILE = testDataFilePath;
  });

  beforeEach(async () => {
    await fs.writeFile(testDataFilePath, JSON.stringify(seedProducts, null, 2));
  });

  afterAll(async () => {
    delete process.env.PRODUCTS_DATA_FILE;
    await fs.rm(testDataFilePath, { force: true });
  });

  it('should complete full inventory workflow', async () => {
    const create = await request(app).post('/api/products').send({
      name: 'Organic Honey',
      category: 'Grocery',
      price: 7.99,
      stock: 6
    });
    expect(create.statusCode).toBe(201);

    const createdId = create.body.id;

    const update = await request(app).put(`/api/products/${createdId}`).send({
      name: 'Organic Honey XL',
      category: 'Grocery',
      price: 9.49,
      stock: 10
    });
    expect(update.statusCode).toBe(200);
    expect(update.body.name).toBe('Organic Honey XL');

    const patch = await request(app).patch(`/api/products/${createdId}/stock`).send({ delta: -4 });
    expect(patch.statusCode).toBe(200);
    expect(patch.body.stock).toBe(6);

    const filtered = await request(app).get('/api/products').query({ search: 'Honey' });
    expect(filtered.statusCode).toBe(200);
    expect(filtered.body.count).toBe(1);

    const dashboard = await request(app).get('/api/dashboard');
    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.body.totalProducts).toBe(3);

    const remove = await request(app).delete(`/api/products/${createdId}`);
    expect(remove.statusCode).toBe(200);

    const verify = await request(app).get('/api/products').query({ search: 'Honey' });
    expect(verify.body.count).toBe(0);
  });

  it('should include CORS headers for client apps', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
