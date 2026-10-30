import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';
import { api } from '../../api/client';
import { Order, OrderStatus, Pagination } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  // Status Update Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Processing');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('Nexora Express');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: 12
      };
      if (search.trim()) params.search = search.trim();
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await api.get('/orders', { params });
      setOrders(res.data.data);
      if (res.data.meta?.pagination) setPagination(res.data.meta.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, selectedStatus, currentPage]);

  const handleOpenStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusNote('');
    setTrackingNumber(ord.trackingNumber || '');
    setCarrier(ord.carrier || 'Nexora Express');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined
      });

      showToast(`Order status updated to ${newStatus}`, 'success');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Status transition rejected', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-mint-green/20 text-mint-green border-mint-green/40';
      case 'Shipped':
        return 'bg-electric-purple/20 text-electric-purple border-electric-purple/40';
      case 'Processing':
      case 'Confirmed':
        return 'bg-neon-lime/20 text-neon-lime border-neon-lime/40';
      case 'Cancelled':
      case 'Payment Failed':
        return 'bg-coral-red/20 text-coral-red border-coral-red/40';
      default:
        return 'bg-lavender-grey/20 text-lavender-grey border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-white">Order Pipeline Management</h1>
        <p className="text-xs text-lavender-grey mt-1">
          Enforce state machine transitions, dispatch parcels, and inspect transaction telemetry
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-slate/60 border border-white/5">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-lavender-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-dark-navy border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-dark-navy border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-electric-purple"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-dark-slate/60 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-slate border-b border-white/10 text-lavender-grey font-mono uppercase text-[10px]">
                <th className="py-4 px-6">Order #</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-6 text-right">Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-lavender-grey">
                    Loading order pipeline records...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-lavender-grey">
                    No orders match current criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-white">#{ord.orderNumber}</td>
                    <td className="py-4 px-4 text-white">
                      {typeof ord.user === 'object' ? ord.user.name : ord.shippingAddress.fullName}
                      <span className="text-[10px] text-lavender-grey/60 block">{ord.shippingAddress.city}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-lavender-grey">{ord.paymentMethod.toUpperCase()}</span>
                      <span className="text-[10px] text-mint-green block">({ord.paymentStatus})</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-neon-lime">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-lavender-grey">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-electric-purple/20 hover:bg-electric-purple text-white font-semibold text-xs transition-colors"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Update Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-lavender-grey">
                  Current Status: <strong className="text-neon-lime">{selectedOrder.status}</strong>
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-lavender-grey hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-lavender-grey mb-1 font-medium">New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2.5 text-white font-bold"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled (Restores Inventory)</option>
                </select>
              </div>

              {newStatus === 'Shipped' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-lavender-grey mb-1">Carrier Name</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-lavender-grey mb-1">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TRK-NEX-9801"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-lavender-grey mb-1">Transition Note</label>
                <textarea
                  rows={2}
                  placeholder="Reason or dispatch notes..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-lavender-grey font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl bg-electric-purple text-white font-bold shadow-glow-purple"
                >
                  {updating ? 'Validating...' : 'Commit Status Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
