'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lowStockOnly) params.set('lowStock', 'true');
      if (search) params.set('search', search);
      const { data } = await adminApi.get(`/admin/inventory?${params.toString()}`);
      setVariants(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, [lowStockOnly]);

  const handleUpdateStock = async (variantId) => {
    try {
      await adminApi.put(`/admin/inventory/${variantId}`, { stock: parseInt(newStock) });
      toast.success('Stock updated');
      setEditingStock(null);
      fetchInventory();
    } catch (error) { toast.error(error.response?.data?.message || 'Update failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-charcoal-900">Inventory</h2><p className="text-sm text-muted">Manage stock levels</p></div>
      </div>

      <div className="admin-card">
        <div className="flex gap-4 items-center">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchInventory()} placeholder="Search products..." className="admin-input flex-1" />
          <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="accent-forest-800" />
            Low stock only
          </label>
          <button onClick={fetchInventory} className="admin-btn admin-btn-secondary">Search</button>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        {loading ? <div className="p-12 text-center"><span className="spinner mx-auto" /></div> : (
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Variant</th><th>SKU</th><th>Price</th><th>Stock</th><th>Threshold</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {variants.map((v) => {
                const isLow = v.stock <= (v.lowStockThreshold || 5);
                return (
                  <tr key={v._id}>
                    <td><p className="font-medium text-charcoal-900">{v.product?.name || '—'}</p></td>
                    <td>{v.name}</td>
                    <td className="text-xs text-muted font-mono">{v.sku}</td>
                    <td>₹{v.offerPrice || v.price}</td>
                    <td>
                      {editingStock === v._id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="admin-input w-20 py-1 text-sm" min="0" />
                          <button onClick={() => handleUpdateStock(v._id)} className="text-success text-sm">✓</button>
                          <button onClick={() => setEditingStock(null)} className="text-error text-sm">✕</button>
                        </div>
                      ) : (
                        <span className={`font-semibold ${isLow ? 'text-error' : v.stock === 0 ? 'text-error' : 'text-charcoal-900'}`}>{v.stock}</span>
                      )}
                    </td>
                    <td>{v.lowStockThreshold || 5}</td>
                    <td>
                      <span className={`admin-badge ${v.stock === 0 ? 'bg-error-bg text-error' : isLow ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'}`}>
                        {v.stock === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => { setEditingStock(v._id); setNewStock(v.stock.toString()); }} className="text-sm text-info hover:underline">Update</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
