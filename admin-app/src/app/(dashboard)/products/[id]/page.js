'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiArchive, FiArrowLeft, FiEdit2, FiRotateCcw } from 'react-icons/fi';
import adminApi from '@/lib/api';
import useFileViewerStore from '@/store/useFileViewerStore';
import useConfirmStore from '@/store/useConfirmStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (url) => (url ? `${API_BASE}${url}` : '');

const STATUS_STYLES = {
  active: 'bg-success-bg text-success',
  draft: 'bg-warning-bg text-warning',
  archived: 'bg-charcoal-50 text-charcoal-500',
};

const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN') : '-');
const formatMoney = (value) => (value || value === 0 ? `Rs. ${Number(value).toLocaleString('en-IN')}` : '-');

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm text-charcoal-900 break-words">{value || '-'}</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { openViewer } = useFileViewerStore();
  const confirm = useConfirmStore((state) => state.confirm);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get(`/admin/products/${params.id}`);
      setProduct(data.data);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) loadProduct();
  }, [params?.id]);

  const primaryImage = useMemo(
    () => product?.images?.find((image) => image.isPrimary) || product?.images?.[0],
    [product],
  );

  const totals = useMemo(() => {
    const variants = product?.variants || [];
    const prices = variants.map((variant) => variant.effectivePrice || variant.offerPrice || variant.price).filter((value) => value || value === 0);
    return {
      stock: variants.reduce((sum, variant) => sum + (variant.stock || 0), 0),
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  }, [product]);

  const updateStatus = async (status) => {
    const isUnarchive = status !== 'archived';
    const confirmed = await confirm({
      title: isUnarchive ? 'Unarchive Product' : 'Archive Product',
      message: isUnarchive
        ? `Unarchive "${product.name}" and set it active again?`
        : `Archive "${product.name}"? It will not be visible to customers.`,
      confirmText: isUnarchive ? 'Unarchive' : 'Archive',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      if (status === 'archived') {
        await adminApi.delete(`/admin/products/${product._id}`);
      } else {
        const fd = new FormData();
        fd.append('data', JSON.stringify({ status }));
        await adminApi.put(`/admin/products/${product._id}`, fd);
      }
      toast.success(isUnarchive ? 'Product unarchived' : 'Product archived');
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isUnarchive ? 'unarchive' : 'archive'} product`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <span className="spinner mx-auto" />
        <p className="mt-3 text-sm text-muted">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-card p-12 text-center">
        <p className="text-muted">Product not found</p>
        <button onClick={() => router.push('/products')} className="admin-btn admin-btn-secondary mt-4">Back to Products</button>
      </div>
    );
  }

  const isArchived = product.status === 'archived';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/products" className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal-900">
            <FiArrowLeft size={14} /> Back to products
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-charcoal-900">{product.name}</h2>
            <span className={`admin-badge ${STATUS_STYLES[product.status] || 'bg-charcoal-50 text-charcoal-500'}`}>
              {product.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{product.shortDescription || product.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/products/${product._id}/edit`} className="admin-btn admin-btn-secondary inline-flex items-center gap-2">
            <FiEdit2 size={15} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => updateStatus(isArchived ? 'active' : 'archived')}
            disabled={saving}
            className={`admin-btn inline-flex items-center gap-2 ${isArchived ? 'admin-btn-primary' : 'admin-btn-secondary text-error'}`}
          >
            {isArchived ? <FiRotateCcw size={15} /> : <FiArchive size={15} />}
            {saving ? 'Saving...' : isArchived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="admin-card space-y-4">
          <button
            type="button"
            onClick={() => primaryImage && openViewer(getImgUrl(primaryImage.url))}
            className="relative aspect-square w-full overflow-hidden rounded border border-border bg-charcoal-50"
          >
            {primaryImage ? (
              <Image src={getImgUrl(primaryImage.url)} alt={primaryImage.alt || product.name} fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm text-muted">No image</span>
            )}
          </button>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image) => (
                <button
                  type="button"
                  key={image._id || image.url}
                  onClick={() => openViewer(getImgUrl(image.url))}
                  className="relative aspect-square overflow-hidden rounded border border-border bg-charcoal-50"
                >
                  <Image src={getImgUrl(image.url)} alt={image.alt || ''} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Category" value={product.category?.name} />
            <InfoItem label="Total stock" value={totals.stock} />
            <InfoItem
              label="Price range"
              value={totals.minPrice === null ? '-' : totals.minPrice === totals.maxPrice ? formatMoney(totals.minPrice) : `${formatMoney(totals.minPrice)} - ${formatMoney(totals.maxPrice)}`}
            />
            <InfoItem label="Sold" value={product.totalSold || 0} />
            <InfoItem label="Rating" value={product.averageRating ? `${product.averageRating.toFixed(1)} (${product.totalReviews || 0})` : '-'} />
            <InfoItem label="GST" value={`${product.gstPercentage ?? 0}%`} />
            <InfoItem label="HSN Code" value={product.hsnCode} />
            <InfoItem label="Sort Order" value={product.sortOrder ?? 0} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Created" value={formatDate(product.createdAt)} />
            <InfoItem label="Updated" value={formatDate(product.updatedAt)} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-muted">Labels</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.isFeatured && <span className="admin-badge bg-warning-bg text-warning">Featured</span>}
              {product.isBestSeller && <span className="admin-badge bg-error-bg text-error">Best Seller</span>}
              {product.showInBestSellers && <span className="admin-badge bg-success-bg text-success">Shown in Best Sellers</span>}
              {product.isNewArrival && <span className="admin-badge bg-info-bg text-info">New Arrival</span>}
              {!product.isFeatured && !product.isBestSeller && !product.showInBestSellers && !product.isNewArrival && (
                <span className="text-sm text-muted">No labels</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card space-y-4">
          <h3 className="font-semibold text-charcoal-900">Description</h3>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Short Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal-800">{product.shortDescription || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Full Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal-800">{product.description || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Ingredients</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-charcoal-800">{product.ingredients || '-'}</p>
          </div>
        </section>

        <section className="admin-card space-y-4">
          <h3 className="font-semibold text-charcoal-900">Tags & Specifications</h3>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.tags?.length ? product.tags.map((tag) => (
                <span key={tag} className="rounded bg-charcoal-50 px-2 py-1 text-xs text-charcoal-700">{tag}</span>
              )) : <span className="text-sm text-muted">No tags</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted">Specifications</p>
            {product.specifications?.length ? (
              <div className="mt-2 divide-y divide-border rounded border border-border">
                {product.specifications.map((spec, index) => (
                  <div key={`${spec.key}-${index}`} className="grid grid-cols-2 gap-3 px-3 py-2 text-sm">
                    <span className="font-medium text-charcoal-800">{spec.key || '-'}</span>
                    <span className="text-charcoal-700">{spec.value || '-'}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-2 text-sm text-muted">No specifications</p>}
          </div>
        </section>
      </div>

      <section className="admin-card space-y-4">
        <h3 className="font-semibold text-charcoal-900">Variants</h3>
        {product.variants?.length ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Offer Price</th>
                  <th>Weight</th>
                  <th>Stock</th>
                  <th>Low Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant._id}>
                    <td className="font-medium">{variant.name}</td>
                    <td className="text-xs text-muted">{variant.sku}</td>
                    <td>{formatMoney(variant.price)}</td>
                    <td>{formatMoney(variant.offerPrice)}</td>
                    <td>{variant.weight?.value || '-'} {variant.weight?.unit || ''}</td>
                    <td>{variant.stock ?? 0}</td>
                    <td>{variant.lowStockThreshold ?? '-'}</td>
                    <td>
                      <span className={`admin-badge ${variant.isActive ? 'bg-success-bg text-success' : 'bg-charcoal-50 text-charcoal-500'}`}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No variants added</p>
        )}
      </section>

      <section className="admin-card space-y-4">
        <h3 className="font-semibold text-charcoal-900">SEO</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoItem label="SEO Title" value={product.seoTitle} />
          <InfoItem label="SEO Description" value={product.seoDescription} />
          <InfoItem label="SEO Keywords" value={product.seoKeywords?.join(', ')} />
        </div>
      </section>
    </div>
  );
}
