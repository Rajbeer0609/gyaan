import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('gyaan_guest_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState(null);

  // Sync cart from server when authenticated
  useEffect(() => {
    const fetchServerCart = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const res = await cartService.getCart();
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
      } catch (err) {
        console.error('Failed to load server cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerCart();
  }, [isAuthenticated]);

  // Persist guest cart locally if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('gyaan_guest_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const addToCart = async (product, color, size, quantity = 1) => {
    setError(null);
    if (isAuthenticated) {
      try {
        const res = await cartService.addToCart({
          productId: product._id,
          color,
          size,
          quantity,
        });
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    } else {
      // Local cart addition
      setItems((prev) => {
        const existingIdx = prev.findIndex(
          (i) =>
            (i.product?._id || i.product) === product._id &&
            i.color.toLowerCase() === color.toLowerCase() &&
            i.size.toLowerCase() === size.toLowerCase()
        );

        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              _id: `guest_${Date.now()}_${Math.random()}`,
              product,
              color,
              size,
              quantity,
              price: product.price,
            },
          ];
        }
      });
      return true;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    setError(null);

    if (isAuthenticated) {
      try {
        const res = await cartService.updateCartItem(itemId, quantity);
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setError(null);
    if (isAuthenticated) {
      try {
        const res = await cartService.removeFromCart(itemId);
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items);
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      setItems((prev) => prev.filter((i) => i._id !== itemId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.error(err);
      }
    }
    setItems([]);
    setCoupon(null);
    localStorage.removeItem('gyaan_guest_cart');
  };

  const applyCoupon = async (code) => {
    setError(null);
    try {
      const res = await couponService.validateCoupon(code, subtotal);
      setCoupon(res.data);
      return res.message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.price || item.product?.price || 0;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Complimentary delivery on luxury orders above ₹2,500
  const shippingFee = subtotal > 2500 || items.length === 0 ? 0 : 250;

  const discountAmount = coupon ? coupon.discountAmount : 0;

  // 12% GST included or calculated
  const tax = Math.round((subtotal - discountAmount) * 0.12);

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        itemCount,
        subtotal,
        shippingFee,
        discountAmount,
        tax,
        grandTotal,
        coupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
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
