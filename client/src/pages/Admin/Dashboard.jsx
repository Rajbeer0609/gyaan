import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Aggregating financial & inventory metrics..." />;
  if (!stats) return <p>Failed to load dashboard metrics.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Real-time Analytics
        </span>
        <h1 style={{ fontSize: '2.2rem' }}>Executive Dashboard</h1>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '24px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gross Revenue</span>
            <DollarSign size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {formatPrice(stats.totalRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Confirmed & captured via Razorpay
          </div>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total Orders</span>
            <ShoppingBag size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {stats.totalOrders}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Lifetime client transactions
          </div>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Registered Patrons</span>
            <Users size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {stats.totalCustomers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Active verified member accounts
          </div>
        </div>

        <div style={{ padding: '24px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Garments</span>
            <Package size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {stats.totalProducts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Across all silhouettes & categories
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(300px, 1fr)', gap: '28px' }} className="admin-dash-grid">
        {/* Recent Orders */}
        <div style={{ padding: '28px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Recent Dispatches</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.82rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.recentOrders?.length > 0 ? (
              stats.recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.88rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {ord.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {ord.shippingAddress?.fullName || 'Client'} • {formatDate(ord.createdAt)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                      {formatPrice(ord.total)}
                    </div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No orders registered yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ padding: '28px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--color-warning)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>Low Stock Atelier Inventory</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.lowStockProducts?.length > 0 ? (
              stats.lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      style={{ width: 36, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                    />
                    <div>
                      <div style={{ color: 'var(--color-text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>
                        {formatPrice(p.price)}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: p.totalStock === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                      color: p.totalStock === 0 ? 'var(--color-error)' : 'var(--color-warning)',
                    }}
                  >
                    {p.totalStock === 0 ? 'Sold Out' : `${p.totalStock} left`}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                All silhouettes maintain healthy inventory reserves.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-dash-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
