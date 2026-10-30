import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ChevronLeft,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';
import { Order, OrderStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { showToast } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order? Reserved stock will be restored.')) return;

    setCancelling(true);
    try {
      const res = await api.post(`/orders/${order._id}/cancel`, {
        reason: 'Customer initiated cancellation from portal'
      });
      setOrder(res.data.data);
      showToast('Order cancelled. Stock has been replenished.', 'info');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 rounded-3xl bg-dark-slate/40 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <Link to="/orders" className="text-electric-purple text-xs font-semibold hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled' || order.status === 'Payment Failed';

  const canCancel = ['Pending', 'Confirmed'].includes(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-lavender-grey hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl bg-coral-red/10 border border-coral-red/30 text-coral-red text-xs font-bold hover:bg-coral-red/20 transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Order</span>
          </button>
        )}
      </div>

      {/* Order Header Summary */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-neon-lime uppercase font-bold block mb-1">
            Order Confirmed
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white font-mono">
            #{order.orderNumber}
          </h1>
          <p className="text-xs text-lavender-grey mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-lavender-grey block">Total Order Value</span>
          <span className="font-display font-extrabold text-3xl text-neon-lime font-mono">
            ₹{order.total.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-mint-green block mt-0.5">
            Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
          </span>
        </div>
      </div>

      {/* Lifecycle Timeline Stepper */}
      <div className="p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-6">
        <h2 className="font-display font-bold text-base text-white">Order Status Lifecycle</h2>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-coral-red/10 border border-coral-red/30 text-coral-red text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Order {order.status}</p>
              <p className="text-xs text-coral-red/80 font-normal">
                Inventory hold released and returned to store catalog.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 sm:gap-4 relative pt-2">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm mb-2 transition-all ${
                      isCurrent
                        ? 'bg-neon-lime text-dark-navy shadow-glow-lime scale-110'
                        : isCompleted
                        ? 'bg-electric-purple text-white'
                        : 'bg-dark-navy border border-white/10 text-lavender-grey/40'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold truncate max-w-full ${
                      isCurrent ? 'text-neon-lime font-bold' : isCompleted ? 'text-white' : 'text-lavender-grey/40'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-dark-navy border border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-lavender-grey">Carrier: {order.carrier || 'Nexora Express'}</span>
            <span className="text-neon-lime font-bold">Tracking: {order.trackingNumber}</span>
          </div>
        )}
      </div>

      {/* Grid: Items & Shipping details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items list */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-4">
          <h2 className="font-display font-bold text-base text-white">Purchased Hardware</h2>
          <div className="divide-y divide-white/5">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                    alt={item.title}
                    className="w-14 h-14 rounded-xl object-cover bg-dark-navy shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <span className="text-lavender-grey">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-white">
                  ₹{item.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Shipping & Cost breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-white mb-2">
              <MapPin className="w-4 h-4 text-neon-lime" />
              <span>Destination Address</span>
            </div>
            <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
            <p className="text-lavender-grey">{order.shippingAddress.street}</p>
            <p className="text-lavender-grey">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-lavender-grey">{order.shippingAddress.country}</p>
            <p className="text-lavender-grey font-mono pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>

          {/* Cost Summary */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3 text-xs">
            <h3 className="font-bold text-white mb-2">Payment Summary</h3>
            <div className="flex justify-between text-lavender-grey">
              <span>Items Subtotal</span>
              <span className="font-mono text-white">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-neon-lime font-semibold">
                <span>Coupon ({order.couponCode})</span>
                <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-lavender-grey">
              <span>Express Delivery</span>
              <span className="font-mono text-white">
                {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-lavender-grey">
              <span>GST Tax (18%)</span>
              <span className="font-mono text-white">₹{order.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline font-bold text-white text-sm">
              <span>Total Paid</span>
              <span className="font-display font-extrabold text-xl text-neon-lime font-mono">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
