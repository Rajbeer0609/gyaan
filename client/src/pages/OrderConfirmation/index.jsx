import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(id);
        if (res.data?.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage message="Finalizing bespoke confirmation..." />;

  if (!order) {
    return (
      <div className="container" style={{ padding: '96px 24px', textAlign: 'center' }}>
        <h2>Order Confirmation Pending</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0 32px' }}>
          Your order has been recorded. You can view all your orders in your account portal.
        </p>
        <Link to="/account/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px', maxWidth: '800px' }}>
      {/* Confirmation Banner */}
      <div
        style={{
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '48px 32px',
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'inline-flex', color: 'var(--color-gold)', marginBottom: '16px' }}>
          <CheckCircle2 size={54} />
        </div>
        <span className="editorial-tag" style={{ marginBottom: '12px' }}>
          Confirmed & Secured
        </span>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          Thank You For Your Patronage
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
          Your bespoke order has been accepted. We have sent an archival dispatch confirmation to your email.
        </p>

        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.92rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Order Reference: <strong style={{ color: 'var(--color-gold)' }}>{order.orderNumber}</strong>
        </div>
      </div>

      {/* Order Summary & Delivery Details */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Purchased Garments</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>{order.orderStatus}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', backgroundColor: '#141414' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '4px' }}>{item.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Color: {item.color} | Size: {item.size} | Qty: {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Shipping Destination */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Delivery Destination
          </h4>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})<br />
            {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 ? `${order.shippingAddress.addressLine2}, ` : ''}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
        </div>

        {/* Total breakdown */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Paid via Razorpay</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gold)' }}>
            {formatPrice(order.total)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/account/orders" style={{ flex: 1 }}>
            <Button variant="secondary" fullWidth>
              Track in My Orders
            </Button>
          </Link>
          <Link to="/shop" style={{ flex: 1 }}>
            <Button variant="primary" fullWidth icon={<ArrowRight size={16} />}>
              Continue Exploring
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
