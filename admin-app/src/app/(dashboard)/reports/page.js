'use client';

import { useState, useEffect } from 'react';
import adminApi from '@/lib/api';

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
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [reportType]);

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-charcoal-900">Reports & Analytics</h2><p className="text-sm text-muted">Business insights and sales reports</p></div>

      <div className="admin-card">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select className="admin-input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="sales">Sales Report</option>
              <option value="products">Product Report</option>
              <option value="customers">Customer Report</option>
              <option value="orders">Order Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input type="date" className="admin-input" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input type="date" className="admin-input" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
          </div>
          <button onClick={fetchReport} className="admin-btn admin-btn-primary">Generate</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-card p-12 text-center"><span className="spinner mx-auto" /></div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {data.summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.summary).map(([key, val]) => (
                <div key={key} className="stat-card">
                  <div className="stat-label capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="stat-value mt-1">{typeof val === 'number' && key.toLowerCase().includes('revenue') ? `₹${val.toLocaleString('en-IN')}` : val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          {data.rows && data.rows.length > 0 && (
            <div className="admin-card p-0 overflow-hidden">
              <table className="admin-table">
                <thead>
                  <tr>
                    {Object.keys(data.rows[0]).map((key) => (
                      <th key={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{typeof val === 'number' ? val.toLocaleString('en-IN') : String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!data.rows && !data.summary && (
            <div className="admin-card p-12 text-center text-muted">No data available for the selected period</div>
          )}
        </div>
      ) : (
        <div className="admin-card p-12 text-center text-muted">Select a report type and click Generate</div>
      )}
    </div>
  );
}
