import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND_NAME } from '../utils/constants';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  ArrowLeft,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-gold)' }}>Verifying administrative credentials...</p>
      </div>
    );
  }

  // Admin access guard
  if (!isAdmin) {
    return (
      <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <ShieldAlert size={54} color="var(--color-error)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Restricted Administrative Access</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          This sector is reserved strictly for GYAAN executive personnel.
        </p>
        <Link to="/login?redirect=/admin" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>
          Sign In with Admin Credentials
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Products', href: '/admin/products', icon: <Package size={18} /> },
    { label: 'Categories', href: '/admin/categories', icon: <Layers size={18} /> },
    { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={18} /> },
    { label: 'Customers', href: '/admin/customers', icon: <Users size={18} /> },
    { label: 'Coupons', href: '/admin/coupons', icon: <Tag size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070707' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          flexShrink: 0,
        }}
        className="admin-sidebar"
      >
        <div style={{ padding: '0 12px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.2em', color: 'var(--color-gold)' }}>
            {BRAND_NAME}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>
            Executive Console
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '20px', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <ArrowLeft size={16} /> Return to Store
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: 'var(--color-error)',
              textAlign: 'left',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 70px !important;
            padding: 16px 8px !important;
          }
          .admin-sidebar span {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
