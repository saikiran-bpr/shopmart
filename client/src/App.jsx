import { useCallback, useEffect, useMemo, useState } from 'react';

const initialForm = {
    name: '',
    category: '',
    price: '',
    stock: ''
};

function App() {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const [health, setHealth] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [filters, setFilters] = useState({ search: '', category: '', inStock: 'all' });

    const categories = useMemo(() => {
        const values = products.map((item) => item.category);
        return [...new Set(values)].sort();
    }, [products]);

    const loadProducts = useCallback(async () => {
        const query = new URLSearchParams();
        if (filters.search) {
            query.set('search', filters.search);
        }
        if (filters.category) {
            query.set('category', filters.category);
        }
        if (filters.inStock === 'yes') {
            query.set('inStock', 'true');
        }
        if (filters.inStock === 'no') {
            query.set('inStock', 'false');
        }

        const response = await fetch(`${apiUrl}/api/products?${query.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const payload = await response.json();
        setProducts(payload.products || []);
    }, [apiUrl, filters.category, filters.inStock, filters.search]);

    const loadDashboard = useCallback(async () => {
        const response = await fetch(`${apiUrl}/api/dashboard`);
        if (!response.ok) {
            throw new Error('Failed to load dashboard');
        }

        const payload = await response.json();
        setDashboard(payload);
    }, [apiUrl]);

    const loadHealth = useCallback(async () => {
        const response = await fetch(`${apiUrl}/api/health`);
        if (!response.ok) {
            throw new Error('Backend health check failed');
        }

        const payload = await response.json();
        setHealth(payload);
    }, [apiUrl]);

    const refreshAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            await Promise.all([loadHealth(), loadDashboard(), loadProducts()]);
        } catch (err) {
            setError(err.message || 'Something went wrong while loading data.');
        } finally {
            setLoading(false);
        }
    }, [loadDashboard, loadHealth, loadProducts]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    function handleFormChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleFilterChange(event) {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }

    function startEdit(product) {
        setEditingId(product.id);
        setForm({
            name: product.name,
            category: product.category,
            price: String(product.price),
            stock: String(product.stock)
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(initialForm);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            name: form.name.trim(),
            category: form.category.trim(),
            price: Number(form.price),
            stock: Number(form.stock)
        };

        try {
            const endpoint = editingId ? `${apiUrl}/api/products/${editingId}` : `${apiUrl}/api/products`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const body = await response.json();
                const message = body.errors ? body.errors.join(', ') : body.message || 'Save failed';
                throw new Error(message);
            }

            setForm(initialForm);
            setEditingId(null);
            await Promise.all([loadProducts(), loadDashboard()]);
        } catch (err) {
            setError(err.message || 'Unable to save product');
        } finally {
            setSaving(false);
        }
    }

    async function removeProduct(productId) {
        setError('');
        try {
            const response = await fetch(`${apiUrl}/api/products/${productId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Delete failed');
            }
            await Promise.all([loadProducts(), loadDashboard()]);
        } catch (err) {
            setError(err.message || 'Unable to delete product');
        }
    }

    async function adjustStock(productId, delta) {
        setError('');
        try {
            const response = await fetch(`${apiUrl}/api/products/${productId}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta })
            });

            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.message || 'Unable to update stock');
            }

            await Promise.all([loadProducts(), loadDashboard()]);
        } catch (err) {
            setError(err.message || 'Unable to update stock');
        }
    }

    return (
        <div className="app-shell">
            <header className="hero">
                <div>
                    <p className="eyebrow">ShopSmart Platform</p>
                    <h1>Inventory Control Dashboard</h1>
                    <p className="subtitle">
                        Manage catalog, track stock movement, and monitor inventory value in real time.
                    </p>
                </div>
                <button type="button" className="refresh-btn" onClick={refreshAll}>
                    Refresh
                </button>
            </header>

            {error && <p className="error-banner">{error}</p>}

            <section className="metrics-grid">
                <article className="metric-card">
                    <h3>Backend Status</h3>
                    <p className="metric-value">{health?.status?.toUpperCase() || '...'}</p>
                </article>
                <article className="metric-card">
                    <h3>Total Products</h3>
                    <p className="metric-value">{dashboard?.totalProducts ?? 0}</p>
                </article>
                <article className="metric-card">
                    <h3>Total Units</h3>
                    <p className="metric-value">{dashboard?.totalUnitsInStock ?? 0}</p>
                </article>
                <article className="metric-card">
                    <h3>Inventory Value</h3>
                    <p className="metric-value">${dashboard?.totalInventoryValue?.toFixed?.(2) ?? '0.00'}</p>
                </article>
            </section>

            <section className="panel-grid">
                <article className="panel">
                    <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
                    <form className="product-form" onSubmit={handleSubmit}>
                        <input
                            name="name"
                            placeholder="Product name"
                            value={form.name}
                            onChange={handleFormChange}
                            required
                        />
                        <input
                            name="category"
                            placeholder="Category"
                            value={form.category}
                            onChange={handleFormChange}
                            required
                        />
                        <input
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={form.price}
                            onChange={handleFormChange}
                            required
                        />
                        <input
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Stock"
                            value={form.stock}
                            onChange={handleFormChange}
                            required
                        />
                        <div className="row-actions">
                            <button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                            </button>
                            {editingId && (
                                <button type="button" className="ghost" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </article>

                <article className="panel">
                    <h2>Filters</h2>
                    <div className="filter-grid">
                        <input
                            name="search"
                            placeholder="Search by name/category"
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All categories</option>
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <select name="inStock" value={filters.inStock} onChange={handleFilterChange}>
                            <option value="all">All stock states</option>
                            <option value="yes">In stock</option>
                            <option value="no">Out of stock</option>
                        </select>
                    </div>
                </article>
            </section>

            <section className="panel products-panel">
                <div className="products-header">
                    <h2>Products</h2>
                    <span>{loading ? 'Loading...' : `${products.length} items`}</span>
                </div>

                {!loading && products.length === 0 && <p>No products found. Try changing filters.</p>}

                <div className="products-list">
                    {products.map((product) => (
                        <article className="product-card" key={product.id}>
                            <div>
                                <h3>{product.name}</h3>
                                <p className="product-meta">{product.category}</p>
                            </div>
                            <div className="product-stats">
                                <p>${Number(product.price).toFixed(2)}</p>
                                <p>Stock: {product.stock}</p>
                            </div>
                            <div className="product-actions">
                                <button type="button" className="ghost" onClick={() => adjustStock(product.id, 1)}>
                                    +1 Stock
                                </button>
                                <button type="button" className="ghost" onClick={() => adjustStock(product.id, -1)}>
                                    -1 Stock
                                </button>
                                <button type="button" className="ghost" onClick={() => startEdit(product)}>
                                    Edit
                                </button>
                                <button type="button" className="danger" onClick={() => removeProduct(product.id)}>
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default App;
