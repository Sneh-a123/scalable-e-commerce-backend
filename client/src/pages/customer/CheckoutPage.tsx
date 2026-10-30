import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { Address } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Address state
  const defaultAddress: Address = user?.addresses?.find((a) => a.isDefault) ||
    user?.addresses?.[0] || {
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    };

  const [address, setAddress] = useState<Address>(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSandboxSimulator, setShowSandboxSimulator] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingFee = cart.subtotal > 1500 ? 0 : 99;
  const estimatedTax = Math.round(cart.subtotal * 0.18 * 100) / 100;
  const grandTotal = Math.max(0, Math.round((cart.finalTotal + shippingFee + estimatedTax) * 100) / 100);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.fullName || !address.phone || !address.street || !address.city || !address.postalCode) {
      showToast('Please fill in all required shipping address fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      // 1. Create order from cart with atomic inventory reservation
      const res = await api.post(
        '/orders',
        {
          shippingAddress: address,
          paymentMethod,
          notes
        },
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey
          }
        }
      );

      const order = res.data.data;
      setPendingOrderId(order._id);

      if (paymentMethod === 'cod') {
        showToast('Order confirmed with Cash on Delivery!', 'success');
        await clearCart();
        navigate(`/orders/${order._id}`);
      } else {
        // Trigger sandbox payment verification modal
        setShowSandboxSimulator(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Checkout failed. Please check stock and try again.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSandboxPayment = async () => {
    if (!pendingOrderId) return;
    setIsSubmitting(true);

    try {
      // 1. Create sandbox gateway payment record
      const initRes = await api.post('/payments/create-order', {
        orderId: pendingOrderId,
        gateway: paymentMethod === 'stripe' ? 'Stripe_Sandbox' : 'Razorpay_Sandbox'
      });

      const { gatewayOrderId, transactionId } = initRes.data.data;

      // 2. Verify with test bypass / server-side verification
      await api.post('/payments/verify', {
        orderId: pendingOrderId,
        transactionId,
        gatewayOrderId,
        signature: 'sandbox_valid_sig'
      });

      showToast('Payment verified successfully in sandbox mode!', 'success');
      await clearCart();
      navigate(`/orders/${pendingOrderId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Payment verification failed';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
      setShowSandboxSimulator(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Checkout Terminal</h1>
        <p className="text-xs text-lavender-grey mt-1">
          Atomic inventory reservation will be placed upon order placement
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Address & Payment Gateway Selection */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Shipping Address */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-neon-lime" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">1. Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-lavender-grey mb-1.5 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1.5 font-medium">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-lavender-grey mb-1.5 font-medium">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1.5 font-medium">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1.5 font-medium">State *</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1.5 font-medium">Postal Code / PIN *</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple font-mono"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1.5 font-medium">Country</label>
                <input
                  type="text"
                  disabled
                  value={address.country || 'India'}
                  className="w-full bg-dark-navy/50 border border-white/5 rounded-xl px-4 py-2.5 text-lavender-grey cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Gateway Selection */}
          <div className="p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-neon-lime" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white">2. Payment Protocol</h2>
                <span className="text-[11px] text-lavender-grey">Cryptographically verified sandbox test environment</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Razorpay Test */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-32 ${
                  paymentMethod === 'razorpay'
                    ? 'border-electric-purple bg-electric-purple/10 shadow-glow-purple'
                    : 'border-white/10 bg-dark-navy hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Razorpay Test</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-electric-purple"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neon-lime font-mono block">Cards, UPI, NetBanking</span>
                  <span className="text-[10px] text-lavender-grey/70">Instant Sandbox Verify</span>
                </div>
              </label>

              {/* Stripe Test */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-32 ${
                  paymentMethod === 'stripe'
                    ? 'border-electric-purple bg-electric-purple/10 shadow-glow-purple'
                    : 'border-white/10 bg-dark-navy hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Stripe Test</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="accent-electric-purple"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-electric-purple font-mono block">Global Test Cards</span>
                  <span className="text-[10px] text-lavender-grey/70">Simulated 3DS Sandbox</span>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-32 ${
                  paymentMethod === 'cod'
                    ? 'border-electric-purple bg-electric-purple/10 shadow-glow-purple'
                    : 'border-white/10 bg-dark-navy hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-electric-purple"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-mint-green font-mono block">Pay upon delivery</span>
                  <span className="text-[10px] text-lavender-grey/70">Zero Online Gateway Fee</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-lavender-grey mb-1.5 text-xs font-medium">Delivery Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="Special delivery instructions or gate code..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric-purple"
              />
            </div>
          </div>
        </div>

        {/* Right: Order Confirmation Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
            <h2 className="font-display font-extrabold text-lg text-white">Items in Order</h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-dark-navy shrink-0"
                  />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-white truncate">{item.title}</p>
                    <span className="text-lavender-grey">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-white shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between text-lavender-grey">
                <span>Subtotal</span>
                <span className="font-mono text-white">₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {cart.discountTotal > 0 && (
                <div className="flex justify-between text-neon-lime font-semibold">
                  <span>Coupon ({cart.appliedCoupon?.code})</span>
                  <span className="font-mono">-₹{cart.discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-lavender-grey">
                <span>Shipping</span>
                <span className="font-mono text-white">
                  {shippingFee === 0 ? <span className="text-mint-green font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-lavender-grey">
                <span>Estimated Tax (18% GST)</span>
                <span className="font-mono text-white">₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total Due</span>
                <span className="font-display font-extrabold text-2xl text-neon-lime font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-electric-purple hover:bg-electric-purple/90 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-purple active:scale-98 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Reserving Stock & Placing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order • ₹{grandTotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            <div className="p-3 rounded-xl bg-dark-navy/70 border border-white/5 text-[11px] text-lavender-grey flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-mint-green shrink-0" />
              <span>Idempotent safe transaction. Instant stock lock applied.</span>
            </div>
          </div>
        </div>
      </form>

      {/* Sandbox Payment Simulator Modal */}
      {showSandboxSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-electric-purple p-6 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-electric-purple/20 border border-electric-purple flex items-center justify-center mx-auto shadow-glow-purple">
              <CreditCard className="w-7 h-7 text-neon-lime" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-neon-lime/20 text-neon-lime uppercase">
                Payment Sandbox Gateway
              </span>
              <h3 className="font-display font-extrabold text-xl text-white mt-2">
                Authorize Test Payment
              </h3>
              <p className="text-xs text-lavender-grey mt-1">
                Total Amount: <span className="font-mono font-bold text-white text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-dark-navy/80 border border-white/5 text-left text-xs font-mono space-y-1.5 text-lavender-grey">
              <div>Order Ref: {pendingOrderId}</div>
              <div>Gateway: {paymentMethod === 'stripe' ? 'Stripe Test' : 'Razorpay Test'}</div>
              <div>Signature: HMAC-SHA256 (Server Verified)</div>
            </div>

            <button
              onClick={handleCompleteSandboxPayment}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-mint-green hover:bg-mint-green/90 text-dark-navy font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-lime transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying HMAC Signature...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Simulate Payment Success</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
