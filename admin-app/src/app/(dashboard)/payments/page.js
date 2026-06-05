'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import adminApi from '@/lib/api';
import { FiSearch, FiEye, FiX, FiAlertCircle, FiCornerDownRight } from 'react-icons/fi';
import ActionMenu from '@/components/ActionMenu';

const statusColors = {
  created: 'bg-info-bg text-info',
  authorized: 'bg-info-bg text-info',
  captured: 'bg-success-bg text-success',
  failed: 'bg-error-bg text-error',
  refunded: 'bg-charcoal-50 text-charcoal-500',
  partially_refunded: 'bg-charcoal-50 text-charcoal-500',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalDocs: 0 });

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 10);
      if (statusFilter) params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);
      
      const { data } = await adminApi.get(`/admin/payments?${params.toString()}`);
      setPayments(data.data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Payments fetch error:', error);
      toast.error('Failed to fetch payments data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments(1);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900">Payments & Transactions</h2>
          <p className="text-sm text-muted">Monitor and audit Razorpay transaction details</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['', 'captured', 'created', 'failed', 'refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`admin-btn text-xs capitalize ${statusFilter === status ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <FiSearch className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search IDs or statuses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-9 w-full"
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Payments Table */}
      <div className="admin-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><span className="spinner mx-auto" /></div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-muted">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer Info</th>
                  <th>Razorpay Order ID</th>
                  <th>Razorpay Payment ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="font-semibold text-charcoal-900">
                      {payment.order ? (
                        <span className="flex items-center gap-1">
                          {payment.order.orderNumber}
                        </span>
                      ) : (
                        <span className="text-error text-xs">Unknown Order</span>
                      )}
                    </td>
                    <td>
                      {payment.order ? (
                        <div>
                          <p className="text-sm font-medium">
                            {payment.order.user?.name || payment.order.guestName || 'Guest User'}
                          </p>
                          <p className="text-xs text-muted">
                            {payment.order.user?.email || payment.order.guestEmail}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">-</span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-charcoal-600">{payment.razorpayOrderId}</td>
                    <td className="font-mono text-xs text-charcoal-600">
                      {payment.razorpayPaymentId ? (
                        <span className="text-forest-700 font-semibold">{payment.razorpayPaymentId}</span>
                      ) : (
                        <span className="text-muted-light">Not capture yet</span>
                      )}
                    </td>
                    <td className="font-semibold">₹{payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="capitalize text-xs text-charcoal-700">
                      {payment.method ? (
                        <span className="bg-charcoal-100 text-charcoal-800 px-2 py-0.5 rounded-full font-medium">
                          {payment.method}
                        </span>
                      ) : (
                        <span className="text-muted-light">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge capitalize ${statusColors[payment.status] || ''}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted font-medium">{formatDateTime(payment.createdAt)}</td>
                    <td>
                      <ActionMenu
                        label={`Open actions for payment ${payment.razorpayOrderId}`}
                        actions={[
                          { label: 'View details', icon: FiEye, onClick: () => setSelectedPayment(payment) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-border mt-4">
          <div className="text-sm text-muted">
            Showing Page <span className="font-semibold text-charcoal-900">{pagination.page}</span> of <span className="font-semibold text-charcoal-900">{pagination.totalPages}</span> ({pagination.totalDocs} total docs)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPayments(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="admin-btn admin-btn-secondary text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchPayments(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="admin-btn admin-btn-secondary text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPayment && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedPayment(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl max-h-[85vh] overflow-y-auto" id="payment-detail-modal">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900">Transaction Details</h3>
                  <p className="text-xs text-muted">Razorpay order ID: {selectedPayment.razorpayOrderId}</p>
                </div>
                <button onClick={() => setSelectedPayment(null)} className="text-xl text-muted hover:text-charcoal-900">
                  <FiX />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Upper row: amount, status, date */}
                <div className="grid grid-cols-3 gap-4 border border-border rounded-xl p-4 bg-charcoal-50/50">
                  <div className="text-center border-r border-border">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Transaction Amount</p>
                    <p className="text-xl font-bold text-charcoal-900 mt-1">
                      ₹{selectedPayment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center border-r border-border">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Status</p>
                    <p className="mt-1">
                      <span className={`admin-badge capitalize text-xs inline-block font-semibold ${statusColors[selectedPayment.status] || ''}`}>
                        {selectedPayment.status}
                      </span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Payment Method</p>
                    <p className="text-sm font-semibold text-charcoal-800 capitalize mt-1.5">
                      {selectedPayment.method || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Integration Identifiers */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">Payment Gateway References</h4>
                  <div className="grid gap-2 text-sm bg-white p-4 rounded-lg border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted">Razorpay Order ID:</span>
                      <span className="font-mono text-charcoal-800 font-semibold">{selectedPayment.razorpayOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Razorpay Payment ID:</span>
                      <span className="font-mono text-charcoal-800 font-semibold">
                        {selectedPayment.razorpayPaymentId || <span className="text-muted-light font-sans font-normal">Pending callback</span>}
                      </span>
                    </div>
                    {selectedPayment.razorpaySignature && (
                      <div className="flex justify-between flex-col">
                        <span className="text-muted mb-1">Razorpay HMAC Signature:</span>
                        <span className="font-mono text-[10px] break-all bg-charcoal-50 p-2 rounded text-charcoal-600 select-all border border-border-light">
                          {selectedPayment.razorpaySignature}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subdetails (Method particulars) */}
                {(selectedPayment.bank || selectedPayment.wallet || selectedPayment.vpa) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">Payment Particulars</h4>
                    <div className="grid gap-2 text-sm bg-white p-4 rounded-lg border border-border">
                      {selectedPayment.bank && (
                        <div className="flex justify-between">
                          <span className="text-muted">Bank Name:</span>
                          <span className="font-medium text-charcoal-800">{selectedPayment.bank}</span>
                        </div>
                      )}
                      {selectedPayment.wallet && (
                        <div className="flex justify-between">
                          <span className="text-muted">Wallet:</span>
                          <span className="font-medium text-charcoal-800">{selectedPayment.wallet}</span>
                        </div>
                      )}
                      {selectedPayment.vpa && (
                        <div className="flex justify-between">
                          <span className="text-muted">UPI VPA Address:</span>
                          <span className="font-mono text-charcoal-800 font-semibold">{selectedPayment.vpa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Associated Order Reference */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">Associated Order details</h4>
                  {selectedPayment.order ? (
                    <div className="bg-white p-4 rounded-lg border border-border space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-charcoal-900 font-semibold">
                          <span>Order ID: {selectedPayment.order.orderNumber}</span>
                        </div>
                        <span className="text-xs text-muted">Placed on {formatDateTime(selectedPayment.order.createdAt)}</span>
                      </div>
                      <hr className="border-border-light" />
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted font-medium mb-0.5">Billing Name</p>
                          <p className="font-medium text-charcoal-800">
                            {selectedPayment.order.user?.name || selectedPayment.order.guestName || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted font-medium mb-0.5">Contact Contact</p>
                          <p className="font-mono text-charcoal-800">
                            {selectedPayment.order.user?.email || selectedPayment.order.guestEmail}
                          </p>
                        </div>
                      </div>
                      <div className="pt-1 flex justify-between items-center text-xs">
                        <span className="text-muted">Order Processing Status:</span>
                        <span className="font-semibold text-charcoal-700 capitalize">{selectedPayment.order.orderStatus}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm flex items-center gap-2">
                      <FiAlertCircle className="flex-shrink-0" />
                      <span>Warning: No order is currently associated with this transaction record.</span>
                    </div>
                  )}
                </div>

                {/* Error Log */}
                {selectedPayment.status === 'failed' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FiAlertCircle /> Transaction Failure Logs
                    </h4>
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm space-y-1">
                      <p><strong className="font-semibold">Error Code:</strong> {selectedPayment.errorCode || 'N/A'}</p>
                      <p><strong className="font-semibold">Reason for Failure:</strong> {selectedPayment.errorDescription || 'No description supplied'}</p>
                    </div>
                  </div>
                )}

                {/* Refund Status */}
                {selectedPayment.refundId && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider flex items-center gap-1">
                      <FiCornerDownRight /> Refund Transaction Particulars
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-border space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Refund ID:</span>
                        <span className="font-mono text-charcoal-800 font-semibold">{selectedPayment.refundId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Refunded Amount:</span>
                        <span className="font-semibold text-charcoal-900">
                          ₹{selectedPayment.refundAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Refund Status:</span>
                        <span className="capitalize font-semibold text-forest-700">{selectedPayment.refundStatus}</span>
                      </div>
                      {selectedPayment.refundedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted">Refund Time:</span>
                          <span className="text-charcoal-700">{formatDateTime(selectedPayment.refundedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
