'use client';

import { useState, useEffect } from 'react';
import adminApi from '@/lib/api';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: reportType });
      if (dateRange.from) params.set('from', dateRange.from);
      if (dateRange.to) params.set('to', dateRange.to);
      const { data: res } = await adminApi.get(`/admin/reports?${params.toString()}`);
      setData(res.data);
    } catch { 
      // Handle error implicitly
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchReport(); }, [reportType]);

  const getSummaryIcon = (key) => {
    const k = key.toLowerCase();
    if (k.includes('revenue')) return <FiDollarSign className="w-5 h-5 text-success" />;
    if (k.includes('order')) return <FiShoppingBag className="w-5 h-5 text-primary" />;
    if (k.includes('customer')) return <FiUsers className="w-5 h-5 text-secondary" />;
    return <FiTrendingUp className="w-5 h-5 text-warning" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-charcoal-900">Reports & Analytics</h2>
        <p className="text-sm text-muted">Business insights and sales performance</p>
      </div>

      <div className="admin-card bg-surface-container-low border-none shadow-sm p-5 rounded-2xl">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">Report Type</label>
            <select className="admin-input bg-white w-full" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="sales">Sales & Revenue Report</option>
              <option value="products">Top Products Report</option>
              <option value="customers">Top Customers Report</option>
              <option value="orders">Recent Orders Report</option>
            </select>
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">Date From</label>
            <input type="date" className="admin-input bg-white w-full text-sm" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
          </div>
          <div className="w-40">
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">Date To</label>
            <input type="date" className="admin-input bg-white w-full text-sm" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
          </div>
          <button onClick={fetchReport} className="admin-btn admin-btn-primary h-[42px] px-6 flex items-center gap-2">
            <FiTrendingUp /> Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card p-24 text-center border-dashed">
          <span className="spinner mx-auto w-8 h-8" />
          <p className="mt-4 text-sm text-muted">Analyzing data...</p>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Cards */}
          {data.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.summary).map(([key, val]) => (
                <div key={key} className="stat-card flex items-center gap-4 bg-white shadow-sm border border-border p-5 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                    {getSummaryIcon(key)}
                  </div>
                  <div>
                    <div className="stat-label text-xs font-semibold uppercase tracking-wider text-muted">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="stat-value mt-1 text-2xl font-bold text-charcoal-900">
                      {typeof val === 'number' && key.toLowerCase().includes('revenue') ? `₹${val.toLocaleString('en-IN')}` : val.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          {data.rows && data.rows.length > 0 ? (
            <div className="admin-card p-0 overflow-hidden shadow-sm border-none">
              <div className="overflow-x-auto">
                <table className="admin-table w-full">
                  <thead className="bg-surface-container-low">
                    <tr>
                      {Object.keys(data.rows[0]).map((key) => (
                        <th key={key} className="capitalize text-xs font-semibold tracking-wider text-charcoal-700 py-4 px-6 border-b border-border">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-charcoal-50 transition-colors">
                        {Object.entries(row).map(([key, val], j) => (
                          <td key={j} className="py-4 px-6 text-sm text-charcoal-800">
                            {typeof val === 'number' ? (
                              key.toLowerCase().includes('revenue') || key.toLowerCase().includes('value') || key.toLowerCase().includes('spent') || key.toLowerCase().includes('total') || key.toLowerCase().includes('price') ? 
                              `₹${val.toLocaleString('en-IN')}` : val.toLocaleString('en-IN')
                            ) : (
                              val === 'paid' ? <span className="admin-badge bg-success-bg text-success">{val}</span> :
                              val === 'failed' ? <span className="admin-badge bg-error-bg text-error">{val}</span> :
                              val === 'pending' || val === 'pending_payment' ? <span className="admin-badge bg-warning-bg text-warning">{val}</span> :
                              val === 'delivered' ? <span className="admin-badge bg-primary/10 text-primary">{val}</span> :
                              val === 'cancelled' ? <span className="admin-badge bg-error-bg text-error">{val}</span> :
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="admin-card p-16 text-center border-dashed">
              <FiTrendingUp className="w-12 h-12 mx-auto text-outline mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-charcoal-900 mb-1">No Data Found</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">There is no data available for the selected report type and date range.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-card p-16 text-center border-dashed">
          <FiTrendingUp className="w-12 h-12 mx-auto text-outline mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-charcoal-900 mb-1">Ready to Generate</h3>
          <p className="text-sm text-muted">Select a report type and date range, then click Generate to view insights.</p>
        </div>
      )}
    </div>
  );
}
