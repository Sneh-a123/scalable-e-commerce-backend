import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (err: any) {
      console.error('Failed to load cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      showToast('Please sign in to add products to your cart.', 'info');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/cart/items', { productId, quantity });
      setCart(res.data.data);
      showToast('Added to cart!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(res.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      showToast(msg, 'error');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      setCart(res.data.data);
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      setCart(res.data.data);
    } catch (err: any) {
      console.error('Failed to clear cart', err);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      setCart(res.data.data);
      showToast(`Coupon ${code.toUpperCase()} applied!`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon';
      showToast(msg, 'error');
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await api.delete('/cart/coupon');
      setCart(res.data.data);
      showToast('Coupon removed', 'info');
    } catch (err: any) {
      console.error('Failed to remove coupon', err);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
