import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useUI } from '../../context/UIContext';
import { Search, Eye, Filter } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminOrdersPage = () => {
  const { showToast } = useUI();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        limit: 50,
      });
      if (res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Order status transitioned to ${newStatus}.`);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Operations & Fulfillment
        </span>
        <h1 style={{ fontSize: '2.2rem' }}>Order Management</h1>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: '320px' }}>
          <input
            type="text"
            placeholder="Search by Order ID or Patron Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-muted)' }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', padding: '10px 16px' }}
        >
          <option value="all">All Order Statuses</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                <th style={{ padding: '16px' }}>Reference</th>
                <th style={{ padding: '16px' }}>Patron</th>
                <th style={{ padding: '16px' }}>Items</th>
                <th style={{ padding: '16px' }}>Total Paid</th>
                <th style={{ padding: '16px' }}>Payment Status</th>
                <th style={{ padding: '16px' }}>Order Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{ord.orderNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(ord.createdAt)}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: 'var(--color-text-primary)' }}>{ord.shippingAddress?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ord.shippingAddress?.city}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {ord.items.length} {ord.items.length === 1 ? 'Garment' : 'Garments'}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatPrice(ord.total)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 2,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        backgroundColor: ord.paymentStatus === 'completed' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: ord.paymentStatus === 'completed' ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        backgroundColor: 'var(--color-bg-elevated)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      style={{ padding: 6, color: 'var(--color-text-secondary)' }}
                      title="Inspect Order Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Dossier: ${selectedOrder.orderNumber}`}
          maxWidth="720px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <strong>Patron:</strong> {selectedOrder.shippingAddress?.fullName} ({selectedOrder.shippingAddress?.phone})<br />
                <strong>Email:</strong> {selectedOrder.shippingAddress?.email || 'N/A'}<br />
                <strong>Destination:</strong> {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Razorpay Payment ID:</strong> {selectedOrder.razorpayPaymentId || 'N/A'}<br />
                <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Garments Dispatched</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--color-bg-elevated)', padding: '10px', borderRadius: 4 }}>
                    <img src={item.image} alt={item.name} style={{ width: 40, height: 50, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Color: {item.color} | Size: {item.size} | Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
              <span>Total Transaction Value</span>
              <span style={{ color: 'var(--color-gold)' }}>{formatPrice(selectedOrder.total)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
