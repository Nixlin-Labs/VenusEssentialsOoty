'use client';

// This page renders the product creation form.
// The [id]/page.js handles editing; this page handles creation.
// We re-export the same component but pass a fixed "new" context.

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import adminApi from '@/lib/api';
import useFileViewerStore from '@/store/useFileViewerStore';

const EMPTY_VARIANT = {
  name: '', sku: '', price: '', offerPrice: '',
  weight: { value: '', unit: 'g' },
  stock: '', lowStockThreshold: 10, isDefault: false, isActive: true, sortOrder: 0,
};

export default function NewProductPage() {
  const router = useRouter();
  const { openViewer } = useFileViewerStore();

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', ingredients: '',
    category: '', gstPercentage: 18, hsnCode: '', status: 'active',
    isFeatured: false, isBestSeller: false, showInBestSellers: false, isNewArrival: false,
    tags: '', sortOrder: 0,
    seoTitle: '', seoDescription: '', seoKeywords: '',
    specifications: [],
  });

  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);

  useEffect(() => {
    adminApi.get('/admin/categories').then(({ data }) => setCategories(data.data || []));
  }, []);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleImageFiles = (files) => {
    const arr = Array.from(files);
    setNewImageFiles(prev => [...prev, ...arr]);
    setNewImagePreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (idx) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const updateSpec = (idx, field, val) => setForm(f => ({
    ...f, specifications: f.specifications.map((s, i) => i === idx ? { ...s, [field]: val } : s),
  }));
  const removeSpec = (idx) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }));

  const addVariant = () => setVariants(v => [...v, { ...EMPTY_VARIANT }]);
  const updateVariant = (idx, field, val) => setVariants(prev =>
    prev.map((v, i) => i === idx ? { ...v, [field]: val } : v)
  );
  const updateVariantWeight = (idx, field, val) => setVariants(prev =>
    prev.map((v, i) => i === idx ? { ...v, weight: { ...v.weight, [field]: val } } : v)
  );
  const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const productData = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        seoKeywords: form.seoKeywords.split(',').map(t => t.trim()).filter(Boolean),
        gstPercentage: Number(form.gstPercentage),
        sortOrder: Number(form.sortOrder),
      };
      fd.append('data', JSON.stringify(productData));
      newImageFiles.forEach(f => fd.append('images', f));

      const { data } = await adminApi.post('/admin/products', fd);
      const productId = data.data._id;

      for (const v of variants) {
        if (!v.name || !v.sku || !v.price || !v.weight.value) continue;
        await adminApi.post(`/admin/products/${productId}/variants`, {
          ...v,
          price: Number(v.price),
          offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
          stock: Number(v.stock),
          weight: { value: Number(v.weight.value), unit: v.weight.unit },
        });
      }

      toast.success('Product created!');
      router.push('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: '📦 Basic' },
    { id: 'images', label: '🖼️ Images' },
    { id: 'variants', label: '🔖 Variants' },
    { id: 'seo', label: '🔍 SEO' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">New Product</h2>
          <p className="text-sm text-muted">Add a new product to your catalog</p>
        </div>
        <Link href="/products" className="admin-btn admin-btn-secondary">← Back</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id ? 'border-forest-800 text-forest-800' : 'border-transparent text-muted hover:text-charcoal-900'
            }`}>{tab.label}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ---- BASIC INFO ---- */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="admin-card space-y-5">
              <h3 className="font-semibold text-charcoal-900">Product Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input type="text" className="admin-input" value={form.name}
                    onChange={e => setField('name', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select className="admin-input" value={form.category}
                    onChange={e => setField('category', e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="admin-input" value={form.status} onChange={e => setField('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <input type="text" className="admin-input" maxLength={300} value={form.shortDescription}
                    onChange={e => setField('shortDescription', e.target.value)}
                    placeholder="Brief product summary (max 300 chars)" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Description *</label>
                  <textarea className="admin-input" rows={5} value={form.description}
                    onChange={e => setField('description', e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Ingredients</label>
                  <textarea className="admin-input" rows={3} value={form.ingredients}
                    onChange={e => setField('ingredients', e.target.value)} placeholder="List of ingredients..." />
                </div>
              </div>
            </div>

            <div className="admin-card space-y-5">
              <h3 className="font-semibold text-charcoal-900">Pricing & Tax</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">GST %</label>
                  <select className="admin-input" value={form.gstPercentage}
                    onChange={e => setField('gstPercentage', e.target.value)}>
                    {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HSN Code</label>
                  <input type="text" className="admin-input" value={form.hsnCode}
                    onChange={e => setField('hsnCode', e.target.value)} placeholder="e.g. 33051000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input type="number" className="admin-input" value={form.sortOrder}
                    onChange={e => setField('sortOrder', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="admin-card space-y-5">
              <h3 className="font-semibold text-charcoal-900">Best Seller Section</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Show in Best Sellers</label>
                  <select className="admin-input" value={form.showInBestSellers ? 'true' : 'false'}
                    onChange={e => setField('showInBestSellers', e.target.value === 'true')}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-card space-y-5">
              <h3 className="font-semibold text-charcoal-900">Tags & Labels</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Tags <span className="text-muted">(comma-separated)</span></label>
                <input type="text" className="admin-input" value={form.tags}
                  onChange={e => setField('tags', e.target.value)} placeholder="natural, herbal, skincare" />
              </div>
              <div className="flex flex-wrap gap-6">
                {[
                  { key: 'isFeatured', label: '⭐ Featured' },
                  { key: 'isBestSeller', label: '🔥 Best Seller' },
                  { key: 'isNewArrival', label: '✨ New Arrival' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="accent-forest-800" checked={form[key]}
                      onChange={e => setField(key, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-charcoal-900">Specifications</h3>
                <button type="button" onClick={addSpec} className="admin-btn admin-btn-secondary text-xs py-1 px-3">+ Add Row</button>
              </div>
              {form.specifications.length === 0 && (
                <p className="text-sm text-muted">No specifications added yet.</p>
              )}
              {form.specifications.map((spec, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input type="text" className="admin-input" placeholder="Key (e.g. Volume)" value={spec.key}
                    onChange={e => updateSpec(idx, 'key', e.target.value)} />
                  <input type="text" className="admin-input" placeholder="Value (e.g. 100ml)" value={spec.value}
                    onChange={e => updateSpec(idx, 'value', e.target.value)} />
                  <button type="button" onClick={() => removeSpec(idx)} className="text-error text-lg flex-shrink-0">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- IMAGES ---- */}
        {activeTab === 'images' && (
          <div className="admin-card space-y-6">
            <h3 className="font-semibold text-charcoal-900">Product Images</h3>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-charcoal-50 transition-colors">
              <span className="text-3xl mb-2">📁</span>
              <span className="text-sm text-muted">Click to select images (multiple allowed)</span>
              <input type="file" className="hidden" multiple accept="image/*"
                onChange={e => handleImageFiles(e.target.files)} />
            </label>
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {newImagePreviews.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <button type="button" className="relative h-full w-full overflow-hidden rounded-lg border border-border" onClick={() => openViewer(url)}>
                      <Image src={url} alt="" fill sizes="120px" unoptimized className="object-cover" />
                    </button>
                    {idx === 0 && <span className="absolute top-1 left-1 bg-forest-800 text-white text-xs px-1 rounded">Primary</span>}
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
            {newImagePreviews.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No images selected yet. The first image will be the primary image.</p>
            )}
          </div>
        )}

        {/* ---- VARIANTS ---- */}
        {activeTab === 'variants' && (
          <div className="admin-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-charcoal-900">Product Variants</h3>
              <button type="button" onClick={addVariant} className="admin-btn admin-btn-secondary text-xs py-1 px-3">+ Add Variant</button>
            </div>
            <p className="text-xs text-muted">Each variant represents a size/weight option (e.g. 100g, 200g). At least one variant is required with price and stock.</p>
            {variants.map((v, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal-700">Variant #{idx + 1}</span>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(idx)} className="text-error text-sm hover:underline">Remove</button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Variant Name *</label>
                    <input type="text" className="admin-input" placeholder="e.g. 100g Pack" value={v.name}
                      onChange={e => updateVariant(idx, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">SKU *</label>
                    <input type="text" className="admin-input" placeholder="e.g. VEN-PROD-100G" value={v.sku}
                      onChange={e => updateVariant(idx, 'sku', e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Price (₹) *</label>
                    <input type="number" className="admin-input" min={0} value={v.price}
                      onChange={e => updateVariant(idx, 'price', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Offer Price (₹)</label>
                    <input type="number" className="admin-input" min={0} placeholder="Leave blank if no offer" value={v.offerPrice}
                      onChange={e => updateVariant(idx, 'offerPrice', e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">Weight/Volume *</label>
                      <input type="number" className="admin-input" min={0} placeholder="100" value={v.weight.value}
                        onChange={e => updateVariantWeight(idx, 'value', e.target.value)} />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium mb-1">Unit</label>
                      <select className="admin-input" value={v.weight.unit}
                        onChange={e => updateVariantWeight(idx, 'unit', e.target.value)}>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Stock *</label>
                    <input type="number" className="admin-input" min={0} value={v.stock}
                      onChange={e => updateVariant(idx, 'stock', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Low Stock Threshold</label>
                    <input type="number" className="admin-input" min={0} value={v.lowStockThreshold}
                      onChange={e => updateVariant(idx, 'lowStockThreshold', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Sort Order</label>
                    <input type="number" className="admin-input" min={0} value={v.sortOrder}
                      onChange={e => updateVariant(idx, 'sortOrder', Number(e.target.value))} />
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-forest-800" checked={v.isDefault}
                      onChange={e => updateVariant(idx, 'isDefault', e.target.checked)} />
                    Default Variant
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-forest-800" checked={v.isActive}
                      onChange={e => updateVariant(idx, 'isActive', e.target.checked)} />
                    Active
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- SEO ---- */}
        {activeTab === 'seo' && (
          <div className="admin-card space-y-5">
            <h3 className="font-semibold text-charcoal-900">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title <span className="text-muted text-xs">(max 70 chars)</span></label>
              <input type="text" className="admin-input" maxLength={70} value={form.seoTitle}
                onChange={e => setField('seoTitle', e.target.value)} placeholder="Defaults to product name" />
              <p className="text-xs text-muted mt-1">{form.seoTitle.length}/70</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Description <span className="text-muted text-xs">(max 160 chars)</span></label>
              <textarea className="admin-input" rows={3} maxLength={160} value={form.seoDescription}
                onChange={e => setField('seoDescription', e.target.value)} />
              <p className="text-xs text-muted mt-1">{form.seoDescription.length}/160</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Keywords <span className="text-muted">(comma-separated)</span></label>
              <input type="text" className="admin-input" value={form.seoKeywords}
                onChange={e => setField('seoKeywords', e.target.value)} placeholder="keyword1, keyword2" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/products" className="admin-btn admin-btn-secondary">Cancel</Link>
          <div className="flex gap-3">
            {activeTab !== 'seo' && (
              <button type="button" onClick={() => {
                const order = ['basic', 'images', 'variants', 'seo'];
                const next = order[order.indexOf(activeTab) + 1];
                if (next) setActiveTab(next);
              }} className="admin-btn admin-btn-secondary">Next →</button>
            )}
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating...</> : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
