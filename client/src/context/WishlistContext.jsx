import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('gyaan_guest_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServerWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const res = await wishlistService.getWishlist();
        if (res.data?.wishlist?.products) {
          setItems(res.data.wishlist.products);
        }
      } catch (err) {
        console.error('Failed to load server wishlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('gyaan_guest_wishlist', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  const isInWishlist = (productId) => {
    return items.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const productId = product._id || product;
    const exists = isInWishlist(productId);

    if (exists) {
      if (isAuthenticated) {
        try {
          const res = await wishlistService.removeFromWishlist(productId);
          if (res.data?.wishlist?.products) {
            setItems(res.data.wishlist.products);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setItems((prev) => prev.filter((i) => (i._id || i) !== productId));
      }
    } else {
      if (isAuthenticated) {
        try {
          const res = await wishlistService.addToWishlist(productId);
          if (res.data?.wishlist?.products) {
            setItems(res.data.wishlist.products);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setItems((prev) => [...prev, product]);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await wishlistService.removeFromWishlist(productId);
        if (res.data?.wishlist?.products) {
          setItems(res.data.wishlist.products);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setItems((prev) => prev.filter((i) => (i._id || i) !== productId));
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        itemCount: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
