import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { NAV_LINKS, BRAND_NAME } from '../../utils/constants';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { setMobileNavOpen, setSearchModalOpen } = useUI();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        width: '100%',
        height: 'var(--navbar-height)',
        backgroundColor: scrolled ? 'rgba(8, 8, 8, 0.92)' : 'rgba(8, 8, 8, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? 'var(--color-border)' : 'rgba(255, 255, 255, 0.05)'}`,
        transition: 'all var(--transition-smooth)',
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Mobile menu trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="mobile-only-btn"
            style={{
              display: 'none',
              color: 'var(--color-text-primary)',
              padding: 4,
            }}
            aria-label="Open Navigation"
          >
            <Menu size={22} />
          </button>

          {/* GYAAN Brand Logo */}
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.65rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {BRAND_NAME}
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname + location.search === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: link.isSale
                    ? 'var(--color-error)'
                    : isActive
                    ? 'var(--color-gold)'
                    : 'var(--color-text-secondary)',
                  position: 'relative',
                  padding: '6px 0',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Search, Wishlist, Account, Cart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Search Trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search Catalog"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
              padding: 4,
            }}
          >
            <Search size={20} />
          </button>

          {/* Admin link if administrator */}
          {isAdmin && (
            <Link
              to="/admin"
              aria-label="Admin Dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-gold)',
                padding: 4,
              }}
              title="Admin Dashboard"
            >
              <Shield size={20} />
            </Link>
          )}

          {/* User Account */}
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            aria-label="Account Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
              padding: 4,
            }}
          >
            <User size={20} />
          </Link>

          {/* Wishlist Icon with count badge */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
              transition: 'color var(--transition-fast)',
              position: 'relative',
              padding: 4,
            }}
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with count badge */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-gold)',
              transition: 'color var(--transition-fast)',
              position: 'relative',
              padding: 4,
            }}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  backgroundColor: 'var(--color-gold)',
                  color: '#080808',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-only-btn {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
