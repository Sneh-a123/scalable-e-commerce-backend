import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';
import { Order, OrderStatus } from '../../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/my-orders')
      .then((res) => setOrders(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">My Orders</h1>
        <p className="text-xs text-lavender-grey mt-1">Track status, tracking numbers, and view order receipts</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-dark-slate/40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-dark-slate/40 border border-white/5 text-center flex flex-col items-center">
          <Package className="w-12 h-12 text-lavender-grey/40 mb-3" />
          <h2 className="font-display font-bold text-lg text-white mb-1">No Orders Found</h2>
          <p className="text-xs text-lavender-grey mb-6">You have not placed any orders yet.</p>
          <Link
            to="/shop"
            className="px-6 py-2.5 rounded-xl bg-electric-purple text-white font-bold text-xs shadow-glow-purple"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-6 rounded-2xl bg-dark-slate/80 border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Order Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-extrabold text-base text-white font-mono">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-lavender-grey">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-lavender-grey">
                  <span>{order.items.length} Item(s)</span>
                  <span>•</span>
                  <span>Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</span>
                </div>
              </div>

              {/* Amount & Action */}
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-lavender-grey/60 block">Total Amount</span>
                  <span className="font-display font-extrabold text-lg text-neon-lime font-mono">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
