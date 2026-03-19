const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const dataFilePath = path.join(__dirname, '..', 'data', 'products.json');

app.use(cors());
app.use(express.json());

async function readProducts() {
  const raw = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeProducts(products) {
  await fs.writeFile(dataFilePath, JSON.stringify(products, null, 2));
}

function normalizeProductInput(body) {
  return {
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    price: Number(body.price),
    stock: Number(body.stock)
  };
}

function validateProductInput(product) {
  const errors = [];

  if (!product.name) {
    errors.push('name is required');
  }
  if (!product.category) {
    errors.push('category is required');
  }
  if (Number.isNaN(product.price) || product.price < 0) {
    errors.push('price must be a non-negative number');
  }
  if (!Number.isInteger(product.stock) || product.stock < 0) {
    errors.push('stock must be a non-negative integer');
  }

  return errors;
}

function toBoolean(value) {
  if (value === undefined) {
    return undefined;
  }
  return value === 'true';
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ShopSmart Inventory API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/dashboard', async (req, res, next) => {
  try {
    const products = await readProducts();
    const totalProducts = products.length;
    const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockItems = products.filter((p) => p.stock <= 5).length;

    res.json({
      totalProducts,
      totalUnitsInStock,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products', async (req, res, next) => {
  try {
    const { search = '', category = '', inStock, sortBy = 'updatedAt', order = 'desc' } = req.query;
    const inStockFilter = toBoolean(inStock);
    const searchTerm = String(search).toLowerCase().trim();
    const categoryTerm = String(category).toLowerCase().trim();

    let products = await readProducts();

    products = products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);
      const matchesCategory = !categoryTerm || product.category.toLowerCase() === categoryTerm;
      const matchesStock =
        inStockFilter === undefined ? true : inStockFilter ? product.stock > 0 : product.stock === 0;
      return matchesSearch && matchesCategory && matchesStock;
    });

    products.sort((a, b) => {
      const direction = order === 'asc' ? 1 : -1;

      if (sortBy === 'price' || sortBy === 'stock') {
        return (a[sortBy] - b[sortBy]) * direction;
      }

      return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * direction;
    });

    res.json({
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const products = await readProducts();
    const product = products.find((item) => item.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/products', async (req, res, next) => {
  try {
    const normalized = normalizeProductInput(req.body);
    const validationErrors = validateProductInput(normalized);

    if (validationErrors.length) {
      return res.status(400).json({ errors: validationErrors });
    }

    const products = await readProducts();
    const timestamp = new Date().toISOString();
    const product = {
      id: `p-${Date.now()}`,
      ...normalized,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    products.push(product);
    await writeProducts(products);

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/products/:id', async (req, res, next) => {
  try {
    const normalized = normalizeProductInput(req.body);
    const validationErrors = validateProductInput(normalized);

    if (validationErrors.length) {
      return res.status(400).json({ errors: validationErrors });
    }

    const products = await readProducts();
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = {
      ...products[index],
      ...normalized,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    await writeProducts(products);

    return res.json(updatedProduct);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/products/:id/stock', async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);

    if (!Number.isInteger(delta)) {
      return res.status(400).json({ message: 'delta must be an integer' });
    }

    const products = await readProducts();
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const nextStock = products[index].stock + delta;
    if (nextStock < 0) {
      return res.status(400).json({ message: 'stock cannot be negative' });
    }

    products[index] = {
      ...products[index],
      stock: nextStock,
      updatedAt: new Date().toISOString()
    };

    await writeProducts(products);
    return res.json(products[index]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const products = await readProducts();
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [deleted] = products.splice(index, 1);
    await writeProducts(products);

    return res.json({ message: 'Product deleted', product: deleted });
  } catch (error) {
    return next(error);
  }
});

app.get('/', (req, res) => {
  res.json({
    service: 'ShopSmart Backend Service',
    endpoints: [
      'GET /api/health',
      'GET /api/dashboard',
      'GET /api/products',
      'POST /api/products',
      'PUT /api/products/:id',
      'PATCH /api/products/:id/stock',
      'DELETE /api/products/:id'
    ]
  });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
