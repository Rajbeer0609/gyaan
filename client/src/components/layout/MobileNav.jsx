import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, User, Heart, ShoppingBag, Shield } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { NAV_LINKS, BRAND_NAME } from '../../utils/constants';

export const MobileNav = () => {
  const { mobileNavOpen, setMobileNavOpen } = useUI();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileNavOpen]);

  if (!mobileNavOpen) return null;

  const close = () => setMobileNavOpen(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'relative',
          width: '85%',
          maxWidth: '380px',
          height: '100%',
          backgroundColor: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              letterSpacing: '0.2em',
              color: 'var(--color-text-primary)',
            }}
          >
            {BRAND_NAME}
          </span>
          <button
            onClick={close}
            style={{
              padding: 4,
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={close}
                style={{
                  fontSize: '1.05rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: link.isSale ? 'var(--color-error)' : 'var(--color-text-primary)',
                  fontWeight: 500,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--color-border)',
              margin: '32px 0',
            }}
          />

          {/* Quick Account Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link
              to="/wishlist"
              onClick={close}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-text-secondary)',
                fontSize: '0.92rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={18} /> Wishlist
              </span>
              <span>{wishlistCount}</span>
            </Link>

            <Link
              to="/cart"
              onClick={close}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--color-text-secondary)',
                fontSize: '0.92rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={18} /> Cart
              </span>
              <span>{itemCount}</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={close}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--color-gold)',
                  fontSize: '0.92rem',
                }}
              >
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={close}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.92rem',
                  }}
                >
                  <User size={18} /> My Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    close();
                  }}
                  style={{
                    textAlign: 'left',
                    color: 'var(--color-error)',
                    fontSize: '0.92rem',
                    padding: 0,
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={close}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--color-gold)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                }}
              >
                <User size={18} /> Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
