'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import adminApi from '@/lib/api';
import useFileViewerStore from '@/store/useFileViewerStore';
import useConfirmStore from '@/store/useConfirmStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (url) => (url ? `${API_BASE}${url}` : '');

const EMPTY_VARIANT = {
  name: '', sku: '', price: '', offerPrice: '',
  weight: { value: '', unit: 'g' },
  stock: '', lowStockThreshold: 10, isDefault: false, isActive: true, sortOrder: 0,
};

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== 'new';
  const { openViewer } = useFileViewerStore();
  const confirm = useConfirmStore((state) => state.confirm);

  // ---- Core form state ----
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  // Product fields
  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', ingredients: '',
    category: '', gstPercentage: 18, hsnCode: '', status: 'active',
    isFeatured: false, isBestSeller: false, showInBestSellers: false, isNewArrival: false,
    tags: '', sortOrder: 0,
    seoTitle: '', seoDescription: '', seoKeywords: '',
    specifications: [], // [{key:'',value:''}]
  });

  // Images
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Variants
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);
  const [savedVariants, setSavedVariants] = useState([]); // from DB

  // ---- Load data ----
  useEffect(() => {
    adminApi.get('/admin/categories').then(({ data }) => setCategories(data.data || []));
    if (isEdit) {
      adminApi.get(`/admin/products/${params.id}`)
        .then(({ data }) => {
          const p = data.data;
          setForm({
            name: p.name || '', description: p.description || '',
            shortDescription: p.shortDescription || '', ingredients: p.ingredients || '',
            category: p.category?._id || p.category || '',
            gstPercentage: p.gstPercentage ?? 18, hsnCode: p.hsnCode || '',
            status: p.status || 'active',
            isFeatured: p.isFeatured || false, isBestSeller: p.isBestSeller || false, showInBestSellers: p.showInBestSellers || false,
            isNewArrival: p.isNewArrival || false,
            tags: (p.tags || []).join(', '), sortOrder: p.sortOrder || 0,
            seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '',
            seoKeywords: (p.seoKeywords || []).join(', '),
            specifications: p.specifications || [],
          });
          setExistingImages(p.images || []);
          setSavedVariants(p.variants || []);
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, []);

  // ---- Helpers ----
  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleImageFiles = (files) => {
    const arr = Array.from(files);
    setNewImageFiles(prev => [...prev, ...arr]);
    setNewImagePreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const removeNewImage = (idx) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const setPrimaryImage = (idx) => {
    setExistingImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  // Specifications
  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const updateSpec = (idx, field, val) => setForm(f => ({
    ...f,
    specifications: f.specifications.map((s, i) => i === idx ? { ...s, [field]: val } : s),
  }));
  const removeSpec = (idx) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }));

  // Variants
  const addVariant = () => setVariants(v => [...v, { ...EMPTY_VARIANT }]);
  const updateVariant = (idx, field, val) => setVariants(prev =>
    prev.map((v, i) => i === idx ? { ...v, [field]: val } : v)
  );
  const updateVariantWeight = (idx, field, val) => setVariants(prev =>
    prev.map((v, i) => i === idx ? { ...v, weight: { ...v.weight, [field]: val } } : v)
  );
  const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i !== idx));

  // Delete saved variant
  const deleteSavedVariant = async (variantId) => {
    const confirmed = await confirm({
      title: 'Deactivate Variant',
      message: 'Are you sure you want to deactivate this variant?',
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (!confirmed) return;
    try {
      await adminApi.delete(`/admin/variants/${variantId}`);
      setSavedVariants(prev => prev.filter(v => v._id !== variantId));
      toast.success('Variant removed');
    } catch { toast.error('Failed to remove variant'); }
  };

  // ---- Submit ----
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
        existingImages: isEdit ? existingImages : undefined,
      };
      fd.append('data', JSON.stringify(productData));
      newImageFiles.forEach(f => fd.append('images', f));

      let productId = params?.id;
      if (isEdit) {
        await adminApi.put(`/admin/products/${productId}`, fd);
      } else {
        const { data } = await adminApi.post('/admin/products', fd);
        productId = data.data._id;
      }

      // Create new variants
      for (const v of variants) {
        if (!v.name || !v.sku || !v.price || !v.weight.value) continue;
        const vData = {
          ...v,
          price: Number(v.price),
          offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
          stock: Number(v.stock),
          weight: { value: Number(v.weight.value), unit: v.weight.unit },
        };
        await adminApi.post(`/admin/products/${productId}/variants`, vData);
      }

      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      router.push('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><span className="spinner mx-auto" /></div>;

  const tabs = [
    { id: 'basic', label: '📦 Basic' },
    { id: 'images', label: '🖼️ Images' },
    { id: 'variants', label: '🔖 Variants' },
    { id: 'seo', label: '🔍 SEO' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <p className="text-sm text-muted">{isEdit ? 'Update product details' : 'Add a new product to your catalog'}</p>
        </div>
        <Link href="/products" className="admin-btn admin-btn-secondary">← Back</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-forest-800 text-forest-800'
                : 'border-transparent text-muted hover:text-charcoal-900'
            }`}
          >{tab.label}</button>
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
                    onChange={e => setField('ingredients', e.target.value)}
                    placeholder="List of ingredients..." />
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

            {/* Best Seller Section */}
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
                  <button type="button" onClick={() => removeSpec(idx)} className="text-error hover:text-red-700 text-lg flex-shrink-0">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- IMAGES ---- */}
        {activeTab === 'images' && (
          <div className="admin-card space-y-6">
            <h3 className="font-semibold text-charcoal-900">Product Images</h3>

            {/* Upload zone */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload New Images</label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-charcoal-50 transition-colors">
                <span className="text-3xl mb-2">📁</span>
                <span className="text-sm text-muted">Click to select images (multiple allowed)</span>
                <input type="file" className="hidden" multiple accept="image/*"
                  onChange={e => handleImageFiles(e.target.files)} />
              </label>
            </div>

            {/* New image previews */}
            {newImagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Pending Upload ({newImagePreviews.length})</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {newImagePreviews.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-border cursor-pointer"
                        onClick={() => openViewer(url)} />
                      <button type="button" onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Existing Images</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img src={getImgUrl(img.url)} alt="" className="w-full h-full object-cover rounded-lg border-2 cursor-pointer"
                        style={{ borderColor: img.isPrimary ? 'var(--color-forest-800)' : 'var(--color-border)' }}
                        onClick={() => openViewer(getImgUrl(img.url))} />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 bg-forest-800 text-white text-xs px-1 rounded">Primary</span>
                      )}
                      <div className="absolute bottom-1 left-1 right-1 hidden group-hover:flex gap-1">
                        {!img.isPrimary && (
                          <button type="button" onClick={() => setPrimaryImage(idx)}
                            className="flex-1 bg-forest-800 text-white text-xs rounded py-0.5">Set Primary</button>
                        )}
                        <button type="button" onClick={() => removeExistingImage(idx)}
                          className="flex-1 bg-red-500 text-white text-xs rounded py-0.5">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingImages.length === 0 && newImagePreviews.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No images added yet.</p>
            )}
          </div>
        )}

        {/* ---- VARIANTS ---- */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            {/* Saved variants (edit mode) */}
            {isEdit && savedVariants.length > 0 && (
              <div className="admin-card space-y-4">
                <h3 className="font-semibold text-charcoal-900">Saved Variants</h3>
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead><tr>
                      <th>Name</th><th>SKU</th><th>Price</th><th>Offer Price</th>
                      <th>Weight</th><th>Stock</th><th>Status</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {savedVariants.map(v => (
                        <tr key={v._id}>
                          <td className="font-medium">{v.name}</td>
                          <td className="text-muted text-xs">{v.sku}</td>
                          <td>₹{v.price}</td>
                          <td>{v.offerPrice ? `₹${v.offerPrice}` : '—'}</td>
                          <td>{v.weight?.value} {v.weight?.unit}</td>
                          <td>{v.stock}</td>
                          <td><span className={`admin-badge ${v.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <button type="button" onClick={() => deleteSavedVariant(v._id)}
                              className="text-sm text-error hover:underline">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* New variants to add */}
            <div className="admin-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-charcoal-900">{isEdit ? 'Add New Variants' : 'Variants'}</h3>
                <button type="button" onClick={addVariant} className="admin-btn admin-btn-secondary text-xs py-1 px-3">+ Add Variant</button>
              </div>
              {variants.map((v, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 space-y-4 relative">
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
                      <input type="number" className="admin-input" min={0} placeholder="0.00" value={v.price}
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
                      <label className="block text-xs font-medium mb-1">Low Stock Alert Threshold</label>
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
          </div>
        )}

        {/* ---- SEO ---- */}
        {activeTab === 'seo' && (
          <div className="admin-card space-y-5">
            <h3 className="font-semibold text-charcoal-900">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Title <span className="text-muted text-xs">(max 70 chars)</span></label>
              <input type="text" className="admin-input" maxLength={70} value={form.seoTitle}
                onChange={e => setField('seoTitle', e.target.value)}
                placeholder="Defaults to product name if blank" />
              <p className="text-xs text-muted mt-1">{form.seoTitle.length}/70 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Description <span className="text-muted text-xs">(max 160 chars)</span></label>
              <textarea className="admin-input" rows={3} maxLength={160} value={form.seoDescription}
                onChange={e => setField('seoDescription', e.target.value)} />
              <p className="text-xs text-muted mt-1">{form.seoDescription.length}/160 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SEO Keywords <span className="text-muted">(comma-separated)</span></label>
              <input type="text" className="admin-input" value={form.seoKeywords}
                onChange={e => setField('seoKeywords', e.target.value)} placeholder="keyword1, keyword2, keyword3" />
            </div>
          </div>
        )}

        {/* ---- Footer actions ---- */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/products" className="admin-btn admin-btn-secondary">Cancel</Link>
          <div className="flex gap-3">
            {activeTab !== 'seo' && (
              <button type="button"
                onClick={() => {
                  const order = ['basic', 'images', 'variants', 'seo'];
                  const next = order[order.indexOf(activeTab) + 1];
                  if (next) setActiveTab(next);
                }}
                className="admin-btn admin-btn-secondary">
                Next →
              </button>
            )}
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
