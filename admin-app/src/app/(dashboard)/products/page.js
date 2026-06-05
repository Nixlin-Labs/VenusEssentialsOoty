'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { FiArchive, FiEdit2, FiEye, FiRotateCcw, FiSearch } from 'react-icons/fi';
import adminApi from '@/lib/api';
import useFileViewerStore from '@/store/useFileViewerStore';
import useConfirmStore from '@/store/useConfirmStore';
import CustomDropdown from '@/components/CustomDropdown';
import ActionMenu from '@/components/ActionMenu';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getImgUrl = (url) => (url ? `${API_BASE}${url}` : '');
const PAGE_SIZE = 20;

const STATUS_STYLES = {
  active: 'bg-success-bg text-success',
  draft: 'bg-warning-bg text-warning',
  archived: 'bg-charcoal-50 text-charcoal-500',
};

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const searchableText = (product) => [
  product.name,
  product.slug,
  product.shortDescription,
  product.description,
  product.ingredients,
  product.category?.name,
  product.status,
  product.hsnCode,
  ...(product.tags || []),
  ...(product.seoKeywords || []),
  ...(product.specifications || []).flatMap((spec) => [spec.key, spec.value]),
  ...(product.variants || []).flatMap((variant) => [
    variant.name,
    variant.sku,
    variant.price,
    variant.offerPrice,
    variant.stock,
    variant.weight?.value,
    variant.weight?.unit,
  ]),
].filter(Boolean).join(' ').toLowerCase();

function ProductActions({ product, onArchiveToggle }) {
  const isArchived = product.status === 'archived';

  return (
    <ActionMenu
      label={`Open actions for ${product.name}`}
      actions={[
        { label: 'View details', href: `/products/${product._id}`, icon: FiEye },
        { label: 'Edit', href: `/products/${product._id}/edit`, icon: FiEdit2 },
        {
          label: isArchived ? 'Unarchive' : 'Archive',
          icon: isArchived ? FiRotateCcw : FiArchive,
          success: isArchived,
          danger: !isArchived,
          onClick: () => onArchiveToggle(product),
        },
      ]}
    />
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [busyProductId, setBusyProductId] = useState('');
  const { openViewer } = useFileViewerStore();
  const confirm = useConfirmStore((state) => state.confirm);

  const visibleProducts = useMemo(() => {
    const query = appliedSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => searchableText(product).includes(query));
  }, [products, appliedSearch]);

  const fetchProducts = async (nextPage = page, nextSearch = appliedSearch, nextStatus = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextSearch) params.set('search', nextSearch);
      if (nextStatus) params.set('status', nextStatus);
      params.set('page', nextPage);
      params.set('limit', PAGE_SIZE);
      const { data } = await adminApi.get(`/admin/products?${params.toString()}`);
      setProducts(data.data || []);
      setPagination(data.pagination || { page: nextPage, totalPages: 1, total: 0 });
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, appliedSearch, statusFilter);
  }, [statusFilter, appliedSearch]);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const updateProductStatus = async (product, status) => {
    const isUnarchive = status !== 'archived';
    const confirmed = await confirm({
      title: isUnarchive ? 'Unarchive Product' : 'Archive Product',
      message: isUnarchive
        ? `Unarchive "${product.name}" and make it editable as an active product?`
        : `Archive "${product.name}"? It will not be visible to customers.`,
      confirmText: isUnarchive ? 'Unarchive' : 'Archive',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (!confirmed) return;

    setBusyProductId(product._id);
    try {
      if (status === 'archived') {
        await adminApi.delete(`/admin/products/${product._id}`);
      } else {
        const fd = new FormData();
        fd.append('data', JSON.stringify({ status }));
        await adminApi.put(`/admin/products/${product._id}`, fd);
      }
      toast.success(isUnarchive ? 'Product unarchived' : 'Product archived');
      fetchProducts(page);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isUnarchive ? 'unarchive' : 'archive'} product`);
    } finally {
      setBusyProductId('');
    }
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <div className="space-y-6">
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

      <div className="admin-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-muted" size={16} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search every product field..."
              className="admin-input pl-9"
              id="product-search"
            />
          </div>
          <CustomDropdown
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            isSearchable={false}
            className="md:w-52"
          />
          <button onClick={handleSearch} className="admin-btn admin-btn-secondary" disabled={loading}>
            Search
          </button>
        </div>
      </div>

      <div className="p-0 overflow-hidden admin-card">
        {loading ? (
          <div className="p-12 text-center">
            <span className="mx-auto spinner" />
            <p className="mt-3 text-sm text-muted">Loading products...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="mb-3 text-4xl">Box</p>
            <p className="text-muted">No products found</p>
            <Link href="/products/new" className="inline-flex mt-4 admin-btn admin-btn-primary">+ Add First Product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table" id="products-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Variants</th>
                  <th>Price Range</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  {/* <th>Rating</th>  */}
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product, index) => {
                  const primaryImg = product.images?.find((i) => i.isPrimary) || product.images?.[0];
                  const prices = product.variants?.map((v) => v.effectivePrice || v.offerPrice || v.price).filter(Boolean) || [];
                  const minPrice = prices.length ? Math.min(...prices) : null;
                  const maxPrice = prices.length ? Math.max(...prices) : null;
                  const totalStock = product.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;

                  return (
                    <tr key={product._id} className={busyProductId === product._id ? 'opacity-60' : ''}>
                      <td>{((pagination.page || page) - 1) * PAGE_SIZE + index + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="relative flex-shrink-0 w-12 h-12 overflow-hidden border rounded-lg cursor-pointer bg-charcoal-50 border-border"
                            onClick={() => primaryImg && openViewer(getImgUrl(primaryImg.url))}
                            aria-label={`Preview ${product.name}`}
                          >
                            {primaryImg ? (
                              <Image src={getImgUrl(primaryImg.url)} alt="" fill sizes="48px" className="object-cover" />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-xs text-muted">No img</span>
                            )}
                          </button>
                          <div className="min-w-0">
                            <Link href={`/products/${product._id}`} className="font-medium truncate text-charcoal-900 max-w-48 hover:text-forest-800">
                              {product.name}
                            </Link>
                            <div className="flex gap-1 flex-wrap mt-0.5">
                              {product.isFeatured && <span className="text-xs bg-warning-bg text-warning px-1.5 rounded">Featured</span>}
                              {product.isBestSeller && <span className="text-xs bg-error-bg text-error px-1.5 rounded">Best Seller</span>}
                              {product.isNewArrival && <span className="text-xs bg-info-bg text-info px-1.5 rounded">New</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{product.category?.name || '-'}</td>
                      <td>
                        <span className={`admin-badge ${STATUS_STYLES[product.status] || 'bg-charcoal-50 text-charcoal-500'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="text-center">{product.variants?.length || 0}</td>
                      <td className="text-sm">
                        {minPrice !== null
                          ? minPrice === maxPrice
                            ? `Rs. ${minPrice}`
                            : `Rs. ${minPrice} - Rs. ${maxPrice}`
                          : '-'}
                      </td>
                      <td>
                        <span className={totalStock === 0 ? 'text-error font-medium' : totalStock <= 20 ? 'text-warning font-medium' : 'text-charcoal-700'}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="text-sm">{product.totalSold || 0}</td>
                      {/* <td>
                        {product.averageRating > 0 ? (
                          <span className="flex items-center gap-1 text-sm">
                            <span className="text-warning">*</span>
                            <span>{product.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted">({product.totalReviews})</span>
                          </span>
                        ) : <span className="text-muted">-</span>}
                      </td> */}
                      <td>
                        <ProductActions
                          product={product}
                          onArchiveToggle={(selected) => updateProductStatus(selected, selected.status === 'archived' ? 'active' : 'archived')}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 px-4 py-3 border-t border-border md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted">
              Showing {visibleProducts.length} of {pagination.total} products. Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={(pagination.page || page) <= 1 || loading}
                onClick={() => goToPage((pagination.page || page) - 1)}
                className="px-3 py-1 text-xs admin-btn admin-btn-secondary disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
                Math.max(0, (pagination.page || page) - 3),
                Math.min(pagination.totalPages, (pagination.page || page) + 2),
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  disabled={loading}
                  onClick={() => goToPage(pageNumber)}
                  className={`px-3 py-1 text-xs admin-btn ${
                    pageNumber === (pagination.page || page) ? 'admin-btn-primary' : 'admin-btn-secondary'
                  } disabled:opacity-40`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                disabled={(pagination.page || page) >= pagination.totalPages || loading}
                onClick={() => goToPage((pagination.page || page) + 1)}
                className="px-3 py-1 text-xs admin-btn admin-btn-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
