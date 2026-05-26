'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import adminApi from '@/lib/api';
import useFileViewerStore from '@/store/useFileViewerStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (url) => (url ? `${API_BASE}${url}` : '');

const STATUS_STYLES = {
  active: 'bg-success-bg text-success',
  draft: 'bg-warning-bg text-warning',
  archived: 'bg-charcoal-50 text-charcoal-500',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const { openViewer } = useFileViewerStore();

  const fetchProducts = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', p);
      params.set('limit', 20);
      const { data } = await adminApi.get(`/admin/products?${params.toString()}`);
      setProducts(data.data || []);
      setPagination(data.pagination || {});
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(1); }, [statusFilter]);

  const handleSearch = () => { setPage(1); fetchProducts(1); };

  const handleDelete = async (id, name) => {
    if (!confirm(`Archive product "${name}"? It won't be visible to customers.`)) return;
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toast.success('Product archived');
      fetchProducts(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Products</h2>
          <p className="text-sm text-muted">
            {pagination.total ? `${pagination.total} products` : 'Manage your product catalog'}
          </p>
        </div>
        <Link href="/products/new" className="admin-btn admin-btn-primary" id="add-product-btn">
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or tags..."
              className="admin-input" id="product-search"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-input w-40" id="product-status-filter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={handleSearch} className="admin-btn admin-btn-secondary">Search</button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><span className="spinner mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-muted">No products found</p>
            <Link href="/products/new" className="admin-btn admin-btn-primary mt-4 inline-flex">+ Add First Product</Link>
          </div>
        ) : (
          <table className="admin-table" id="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Variants</th>
                <th>Price Range</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const primaryImg = product.images?.find(i => i.isPrimary) || product.images?.[0];
                const prices = product.variants?.map(v => v.effectivePrice || v.price).filter(Boolean) || [];
                const minPrice = prices.length ? Math.min(...prices) : null;
                const maxPrice = prices.length ? Math.max(...prices) : null;
                const totalStock = product.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;

                return (
                  <tr key={product._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 bg-charcoal-50 rounded-lg flex-shrink-0 overflow-hidden cursor-pointer border border-border"
                          onClick={() => primaryImg && openViewer(getImgUrl(primaryImg.url))}
                        >
                          {primaryImg ? (
                            <img src={getImgUrl(primaryImg.url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-xl">📦</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal-900 truncate max-w-48">{product.name}</p>
                          <div className="flex gap-1 flex-wrap mt-0.5">
                            {product.isFeatured && <span className="text-xs bg-warning-bg text-warning px-1.5 rounded">⭐ Featured</span>}
                            {product.isBestSeller && <span className="text-xs bg-error-bg text-error px-1.5 rounded">🔥 Best Seller</span>}
                            {product.isNewArrival && <span className="text-xs bg-info-bg text-info px-1.5 rounded">✨ New</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{product.category?.name || '—'}</td>
                    <td>
                      <span className={`admin-badge ${STATUS_STYLES[product.status] || 'bg-charcoal-50 text-charcoal-500'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="text-center">{product.variants?.length || 0}</td>
                    <td className="text-sm">
                      {minPrice !== null
                        ? minPrice === maxPrice
                          ? `₹${minPrice}`
                          : `₹${minPrice} – ₹${maxPrice}`
                        : '—'}
                    </td>
                    <td>
                      <span className={totalStock === 0 ? 'text-error font-medium' : totalStock <= 20 ? 'text-warning font-medium' : 'text-charcoal-700'}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="text-sm">{product.totalSold || 0}</td>
                    <td>
                      {product.averageRating > 0 ? (
                        <span className="flex items-center gap-1 text-sm">
                          <span className="text-warning">★</span>
                          <span>{product.averageRating.toFixed(1)}</span>
                          <span className="text-muted text-xs">({product.totalReviews})</span>
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Link href={`/products/${product._id}`} className="text-sm text-info hover:underline">Edit</Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="text-sm text-error hover:underline"
                          disabled={product.status === 'archived'}
                        >
                          {product.status === 'archived' ? 'Archived' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => { setPage(p => p - 1); fetchProducts(page - 1); }}
                className="admin-btn admin-btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >← Prev</button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => { setPage(p => p + 1); fetchProducts(page + 1); }}
                className="admin-btn admin-btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
