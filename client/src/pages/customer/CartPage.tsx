import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Check,
  X,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, isLoading } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-dark-slate border border-white/10 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-electric-purple" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-white mb-2">Sign In to View Cart</h2>
        <p className="text-xs text-lavender-grey mb-6">
          Your shopping cart is persistently synced to your Nexora customer account.
        </p>
        <Link
          to="/login"
          className="inline-flex px-8 py-3 rounded-2xl bg-electric-purple text-white font-bold text-xs shadow-glow-purple"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-dark-slate border border-white/10 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-lavender-grey/40" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-white mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-lavender-grey mb-6">
          Explore our futuristic catalog and add cutting-edge hardware to your cart.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-xs shadow-glow-purple transition-all"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeShippingThreshold = 1500;
  const progressToFreeShipping = Math.min(100, (cart.subtotal / freeShippingThreshold) * 100);
  const shippingFee = cart.subtotal > freeShippingThreshold ? 0 : 99;
  const estimatedTax = Math.round(cart.subtotal * 0.18 * 100) / 100;
  const estimatedGrandTotal = Math.max(0, Math.round((cart.finalTotal + shippingFee + estimatedTax) * 100) / 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponSubmitting(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch {
      // handled by toast in context
    } finally {
      setCouponSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Shopping Cart</h1>
        <p className="text-xs text-lavender-grey mt-1">Review your selections before proceeding to checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert Bar */}
          <div className="p-4 rounded-2xl bg-dark-slate/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-neon-lime" />
                {cart.subtotal >= freeShippingThreshold ? (
                  <span className="text-neon-lime">You unlocked Free Express Shipping!</span>
                ) : (
                  <span>
                    Add ₹{(freeShippingThreshold - cart.subtotal).toLocaleString('en-IN')} more for Free Shipping
                  </span>
                )}
              </span>
              <span className="font-mono text-lavender-grey">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-1.5 bg-dark-navy rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-purple to-neon-lime transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item Cards */}
          <div className="space-y-3">
            {cart.items.map((item) => {
              const prodId = typeof item.product === 'object' ? item.product._id : item.product;
              return (
                <div
                  key={prodId}
                  className="p-4 sm:p-5 rounded-2xl bg-dark-slate/80 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Image & Title */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover bg-dark-navy shrink-0"
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h3>
                      <span className="text-xs font-mono font-bold text-white block mt-1">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex items-center rounded-xl bg-dark-navy border border-white/10 p-1">
                      <button
                        onClick={() => updateQuantity(prodId, item.quantity - 1)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-lavender-grey hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold font-mono text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(prodId, item.quantity + 1)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-lavender-grey hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-xs text-lavender-grey/60 block">Subtotal</span>
                      <span className="font-display font-extrabold text-sm text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(prodId)}
                      className="p-2 rounded-xl text-lavender-grey/60 hover:text-coral-red hover:bg-coral-red/10 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6">
            <h2 className="font-display font-extrabold text-lg text-white">Order Summary</h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <span className="text-xs font-mono font-bold text-lavender-grey uppercase block">Promo Protocol</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. NEXORA20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponSubmitting || !!cart.appliedCoupon}
                  className="flex-1 bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple font-mono"
                />
                <button
                  type="submit"
                  disabled={couponSubmitting || !couponCode.trim() || !!cart.appliedCoupon}
                  className="px-4 py-2 rounded-xl bg-dark-slate hover:bg-white/10 border border-white/10 disabled:opacity-40 text-xs font-bold text-white transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Applied Coupon Tag */}
              {cart.appliedCoupon && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neon-lime/15 border border-neon-lime/30 text-xs mt-2">
                  <div className="flex items-center gap-2 text-neon-lime font-bold">
                    <Check className="w-4 h-4" />
                    <span>{cart.appliedCoupon.code} Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 hover:bg-white/10 rounded-lg text-lavender-grey hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between text-lavender-grey">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {cart.discountTotal > 0 && (
                <div className="flex items-center justify-between text-neon-lime font-semibold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-₹{cart.discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-lavender-grey">
                <span>Express Delivery</span>
                <span className="font-mono text-white">
                  {shippingFee === 0 ? <span className="text-mint-green font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex items-center justify-between text-lavender-grey">
                <span>Estimated GST (18%)</span>
                <span className="font-mono text-white">₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-baseline justify-between text-base">
                <span className="font-bold text-white">Final Estimated Total</span>
                <span className="font-display font-extrabold text-2xl text-neon-lime font-mono">
                  ₹{estimatedGrandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              disabled={isLoading || cart.items.length === 0}
              className="w-full py-4 rounded-2xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-purple transition-all transform active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-lavender-grey/70">
              <ShieldCheck className="w-4 h-4 text-mint-green" />
              <span>Atomic inventory hold placed on checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
