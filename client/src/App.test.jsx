import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

function jsonResponse(data, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data)
  });
}

describe('App Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard and product list from API', async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/health')) {
        return jsonResponse({ status: 'ok', service: 'test' });
      }
      if (String(url).includes('/api/dashboard')) {
        return jsonResponse({
          totalProducts: 2,
          totalUnitsInStock: 30,
          totalInventoryValue: 89.5,
          lowStockItems: 1
        });
      }
      if (String(url).includes('/api/products')) {
        return jsonResponse({
          count: 2,
          products: [
            { id: 'p1', name: 'Rice', category: 'Grocery', price: 10, stock: 12 },
            { id: 'p2', name: 'Milk', category: 'Dairy', price: 3.5, stock: 18 }
          ]
        });
      }
      return jsonResponse({});
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Inventory Control Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Rice/i)).toBeInTheDocument();
      expect(screen.getByText(/Milk/i)).toBeInTheDocument();
    });
  });

  it('submits create product form', async () => {
    global.fetch = vi.fn((url, options) => {
      if (String(url).includes('/api/health')) {
        return jsonResponse({ status: 'ok', service: 'test' });
      }
      if (String(url).includes('/api/dashboard')) {
        return jsonResponse({
          totalProducts: 2,
          totalUnitsInStock: 20,
          totalInventoryValue: 50,
          lowStockItems: 0
        });
      }
      if (String(url).includes('/api/products') && (!options || options.method === undefined)) {
        return jsonResponse({ count: 0, products: [] });
      }
      if (String(url).includes('/api/products') && options?.method === 'POST') {
        return jsonResponse({ id: 'new-1' }, true, 201);
      }
      return jsonResponse({});
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Add Product/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Product name/i);
    const categoryInput = screen.getAllByPlaceholderText(/Category/i)[0];
    const priceInput = screen.getByPlaceholderText(/Price/i);
    const stockInput = screen.getByPlaceholderText(/Stock/i);

    fireEvent.change(nameInput, {
      target: { value: 'Tea' }
    });
    fireEvent.change(categoryInput, {
      target: { value: 'Beverages' }
    });
    fireEvent.change(priceInput, {
      target: { value: '6.20' }
    });
    fireEvent.change(stockInput, {
      target: { value: '15' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
