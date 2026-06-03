'use client';

import { useState, useMemo } from 'react';
import CustomDropdown from '@/components/CustomDropdown';
import CustomDateFilter from '@/components/CustomDateFilter';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { FiDownload, FiFileText, FiGrid, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'sonner';

// High-fidelity Mock Orders Dataset
const MOCK_ORDERS = [
  { id: '1', orderNumber: 'VE-2026-001', customer: 'Aarav Sharma', date: '2026-06-03', category: 'Skincare', items: 3, total: 1850, status: 'completed' },
  { id: '2', orderNumber: 'VE-2026-002', customer: 'Isha Patel', date: '2026-06-02', category: 'Haircare', items: 1, total: 640, status: 'pending' },
  { id: '3', orderNumber: 'VE-2026-003', customer: 'Kabir Singh', date: '2026-06-02', category: 'Wellness', items: 2, total: 2450, status: 'completed' },
  { id: '4', orderNumber: 'VE-2026-004', customer: 'Diya Sen', date: '2026-06-01', category: 'Skincare', items: 4, total: 4200, status: 'completed' },
  { id: '5', orderNumber: 'VE-2026-005', customer: 'Rohan Mehta', date: '2026-05-30', category: 'Essential Oils', items: 2, total: 1100, status: 'cancelled' },
  { id: '6', orderNumber: 'VE-2026-006', customer: 'Ananya Roy', date: '2026-05-28', category: 'Skincare', items: 1, total: 950, status: 'completed' },
  { id: '7', orderNumber: 'VE-2026-007', customer: 'Arjun Gupta', date: '2026-05-25', category: 'Wellness', items: 3, total: 3150, status: 'pending' },
  { id: '8', orderNumber: 'VE-2026-008', customer: 'Meera Nair', date: '2026-05-20', category: 'Haircare', items: 2, total: 1280, status: 'completed' },
  { id: '9', orderNumber: 'VE-2026-009', customer: 'Vivaan Joshi', date: '2026-05-15', category: 'Essential Oils', items: 5, total: 5800, status: 'completed' },
  { id: '10', orderNumber: 'VE-2026-010', customer: 'Sanya Malhotra', date: '2026-05-02', category: 'Wellness', items: 1, total: 850, status: 'cancelled' },
  { id: '11', orderNumber: 'VE-2026-011', customer: 'Dev Patel', date: '2026-06-03', category: 'Wellness', items: 2, total: 1599, status: 'pending' },
  { id: '12', orderNumber: 'VE-2026-012', customer: 'Pooja Hegde', date: '2026-06-01', category: 'Haircare', items: 3, total: 2100, status: 'completed' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'completed', icon: '🟢' },
  { label: 'Pending', value: 'pending', icon: '🟡' },
  { label: 'Cancelled', value: 'cancelled', icon: '🔴' }
];

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Skincare', value: 'Skincare', badge: 'Best Seller' },
  { label: 'Haircare', value: 'Haircare' },
  { label: 'Wellness', value: 'Wellness' },
  { label: 'Essential Oils', value: 'Essential Oils' }
];

// Configuration for Document Exports
const EXPORT_COLUMNS = [
  { label: 'S.No', key: '_index' },
  { label: 'Order Number', key: 'orderNumber' },
  { label: 'Customer Name', key: 'customer' },
  { label: 'Order Date', key: 'date' },
  { label: 'Product Category', key: 'category' },
  { label: 'Items Count', key: 'items' },
  { label: 'Total Amount (INR)', key: 'total' },
  { label: 'Status', key: 'status' }
];

export default function ExampleExportPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Apply filters in memory
  const filteredData = useMemo(() => {
    return MOCK_ORDERS.filter(order => {
      // 1. Status Filter
      if (statusFilter && order.status !== statusFilter) return false;

      // 2. Category Filter
      if (categoryFilter && order.category !== categoryFilter) return false;

      // 3. Date Range Filter
      if (dateRange.startDate && dateRange.endDate) {
        const orderDate = new Date(order.date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        
        // Normalize time zones/offsets for comparison
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        
        if (orderDate < start || orderDate > end) return false;
      }
      return true;
    });
  }, [statusFilter, categoryFilter, dateRange]);

  // Compute stat metrics based on filtered subset
  const metrics = useMemo(() => {
    const totalSales = filteredData.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.total : 0), 0);
    const orderCount = filteredData.length;
    const pendingCount = filteredData.filter(o => o.status === 'pending').length;
    const cancelledCount = filteredData.filter(o => o.status === 'cancelled').length;

    return { totalSales, orderCount, pendingCount, cancelledCount };
  }, [filteredData]);

  // Excel Export Handler
  const handleExcelExport = async () => {
    if (filteredData.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    
    setIsExportingExcel(true);
    try {
      // Capitalize status for export clean up
      const dataToExport = filteredData.map(o => ({
        ...o,
        status: o.status.toUpperCase()
      }));

      await exportToExcel(
        dataToExport,
        EXPORT_COLUMNS.filter(c => c.key !== '_index'), // Index is usually automatic in sheets
        `Venus_Orders_Report_${Date.now()}`
      );
      toast.success('Excel spreadsheet downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Excel export failed');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // PDF Export Handler
  const handlePDFExport = async () => {
    if (filteredData.length === 0) {
      toast.warning('No data available to export');
      return;
    }

    setIsExportingPDF(true);
    try {
      const dataToExport = filteredData.map(o => ({
        ...o,
        status: o.status.toUpperCase()
      }));

      await exportToPDF(
        'Venus Essentials - Order Transaction Report',
        EXPORT_COLUMNS,
        dataToExport,
        `Venus_Orders_Report_${Date.now()}`
      );
      toast.success('PDF report generated and downloaded!');
    } catch (err) {
      toast.error(err.message || 'PDF generation failed');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Customized Dashboard Utilities</h2>
          <p className="text-sm text-muted">
            Showcase page for custom widgets, dynamic date selectors, and global PDF/Excel generation functions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExcelExport}
            disabled={isExportingExcel}
            className="admin-btn admin-btn-secondary text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FiDownload size={14} />
            {isExportingExcel ? 'Exporting...' : 'Export Excel'}
          </button>
          <button
            onClick={handlePDFExport}
            disabled={isExportingPDF}
            className="admin-btn admin-btn-primary text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FiFileText size={14} />
            {isExportingPDF ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest-50 text-forest-800">💰 Sales Volume</span>
          </div>
          <div className="stat-value text-forest-800">₹{metrics.totalSales.toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Revenue (Excl. Cancelled)</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-info-bg text-info">📦 Orders</span>
          </div>
          <div className="stat-value">{metrics.orderCount}</div>
          <div className="stat-label">Matching Transactions</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-warning-bg text-warning">⏳ Pending</span>
          </div>
          <div className="stat-value">{metrics.pendingCount}</div>
          <div className="stat-label">Awaiting Fulfillment</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-error-bg text-error">🚫 Cancelled</span>
          </div>
          <div className="stat-value">{metrics.cancelledCount}</div>
          <div className="stat-label">Refunded / Cancelled Orders</div>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="admin-card">
        <h3 className="text-sm font-semibold text-charcoal-900 mb-3 flex items-center gap-1.5">
          <FiGrid className="text-forest-700" /> Filter Criteria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Custom Dropdown: Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal-500">Order Status</label>
            <CustomDropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              isSearchable={false}
            />
          </div>

          {/* Custom Dropdown: Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal-500">Product Category</label>
            <CustomDropdown
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="All Categories"
              isSearchable={true}
            />
          </div>

          {/* Custom Date Range Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal-500">Timeline Filter</label>
            <CustomDateFilter
              onChange={setDateRange}
              defaultPreset="last30"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Data Table Card */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="px-4 py-3 bg-charcoal-50/50 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wide">
            Records Subset ({filteredData.length} records)
          </span>
          {dateRange.startDate && dateRange.endDate && (
            <span className="text-[10px] bg-charcoal-100 text-charcoal-700 px-2 py-0.5 rounded">
              Range: {dateRange.startDate} to {dateRange.endDate}
            </span>
          )}
        </div>
        
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th className="text-center">Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((order, index) => (
                  <tr key={order.id}>
                    <td className="text-muted text-xs font-medium">{index + 1}</td>
                    <td className="font-semibold text-charcoal-900">{order.orderNumber}</td>
                    <td className="text-sm">{order.customer}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 bg-charcoal-100 text-charcoal-700 rounded">
                        {order.category}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{order.date}</td>
                    <td className="text-center text-sm">{order.items}</td>
                    <td className="font-semibold text-charcoal-900">₹{order.total}</td>
                    <td>
                      <span className={`admin-badge capitalize ${
                        order.status === 'completed' ? 'bg-success-bg text-success' :
                        order.status === 'pending' ? 'bg-warning-bg text-warning' :
                        'bg-error-bg text-error'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-medium text-charcoal-600 mt-2">No matching transactions found</p>
            <p className="text-xs text-muted mt-1">Try broadening your dropdown filter selections or picking a wider date range.</p>
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="admin-card space-y-3.5 bg-forest-50/20 border-forest-200/50">
        <h3 className="text-base font-bold text-forest-900 flex items-center gap-1.5">
          <FiTrendingUp className="text-forest-800" /> Developers Usage Guide
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 leading-relaxed">
            <h4 className="font-semibold text-charcoal-800 uppercase tracking-wide">1. Customized Dropdown</h4>
            <pre className="p-3 bg-surface rounded-md border border-border overflow-x-auto text-[10px] text-charcoal-700">
{`import CustomDropdown from '@/components/CustomDropdown';

<CustomDropdown
  options={[{ label: 'Active', value: 'active', icon: '🟢' }]}
  value={status}
  onChange={setStatus}
  placeholder="Select Status"
  isSearchable={true}
  isMulti={false}
/>`}
            </pre>
          </div>

          <div className="space-y-2 leading-relaxed">
            <h4 className="font-semibold text-charcoal-800 uppercase tracking-wide">2. Customized Date Filter</h4>
            <pre className="p-3 bg-surface rounded-md border border-border overflow-x-auto text-[10px] text-charcoal-700">
{`import CustomDateFilter from '@/components/CustomDateFilter';

<CustomDateFilter
  defaultPreset="last7"
  onChange={({ startDate, endDate, preset }) => {
    // startDate: 'YYYY-MM-DD'
    // endDate: 'YYYY-MM-DD'
    console.log(startDate, endDate);
  }}
/>`}
            </pre>
          </div>

          <div className="space-y-2 leading-relaxed lg:col-span-2">
            <h4 className="font-semibold text-charcoal-800 uppercase tracking-wide">3. Global Excel & PDF Exporter</h4>
            <pre className="p-3 bg-surface rounded-md border border-border overflow-x-auto text-[10px] text-charcoal-700">
{`import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

// Headers configuration: maps array objects keys to custom labels
const headers = [
  { label: 'Order Number', key: 'orderNumber' },
  { label: 'Total Sales', key: 'total' }
];

exportToExcel(dataList, headers, 'filename_prefix');
exportToPDF('Report Header Title', headers, dataList, 'filename_prefix');`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
