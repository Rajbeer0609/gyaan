import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Trash2, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';

export const CartPage = () => {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    discountAmount,
    tax,
    grandTotal,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    error,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="Your Shopping Bag is Empty"
          description="You have not added any pieces from our atelier yet. Discover our curated collections and elevated silhouettes."
          actionText="Discover Collection"
          actionLink="/shop"
        />
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponMsg(null);
      const msg = await applyCoupon(couponCode.trim());
      setCouponMsg({ type: 'success', text: msg });
      setCouponCode('');
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.message });
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
      <div style={{ marginBottom: '32px' }}>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Atelier Bag // {itemCount} {itemCount === 1 ? 'Garment' : 'Garments'}
        </span>
        <h1 style={{ fontSize: '2.4rem' }}>Your Curated Bag</h1>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--color-error)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(280px, 1.2fr)',
          gap: '48px',
          alignItems: 'start',
        }}
        className="cart-layout-grid"
      >
        {/* Left Column: Bag Items */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Garment Details
            </span>
            <button
              onClick={clearCart}
              style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textDecoration: 'underline' }}
            >
              Empty Bag
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {items.map((item) => {
              const product = item.product;
              const title = product?.name || item.name || 'Garment';
              const img = product?.images?.[0] || item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
              const price = item.price || product?.price || 0;
              const slug = product?.slug;

              return (
                <div
                  key={item._id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '20px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    alignItems: 'center',
                  }}
                  className="cart-item-row"
                >
                  {/* Thumbnail */}
                  <Link
                    to={slug ? `/products/${slug}` : '#'}
                    style={{
                      width: '100px',
                      height: '130px',
                      backgroundColor: 'var(--color-bg-surface)',
                      borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden',
                      display: 'block',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img}
                      alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link to={slug ? `/products/${slug}` : '#'}>
                      <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                        {title}
                      </h3>
                    </Link>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '12px' }}>
                      <span>Color: <strong>{item.color}</strong></span>
                      <span>Size: <strong>{item.size}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--color-gold)', fontWeight: 600, marginTop: '4px' }}>
                      {formatPrice(price)}
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          style={{ width: 28, height: 28, color: 'var(--color-text-secondary)' }}
                        >
                          -
                        </button>
                        <span style={{ width: 32, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{ width: 28, height: 28, color: 'var(--color-text-secondary)' }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}
                        title="Remove garment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatPrice(price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '32px',
            position: 'sticky',
            top: '100px',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              marginBottom: '24px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '16px',
            }}
          >
            Order Summary
          </h3>

          {/* Coupon Code Input */}
          <div style={{ marginBottom: '24px' }}>
            {coupon ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(201, 169, 110, 0.1)',
                  border: '1px solid var(--color-gold-border)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Tag size={16} />
                  <span>{coupon.code} applied (-{formatPrice(coupon.discountAmount)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Promotional code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ textTransform: 'uppercase', fontSize: '0.85rem', padding: '10px 14px' }}
                />
                <Button type="submit" variant="outline" size="sm" loading={couponLoading}>
                  Apply
                </Button>
              </form>
            )}

            {couponMsg && (
              <div
                style={{
                  fontSize: '0.8rem',
                  marginTop: '8px',
                  color: couponMsg.type === 'success' ? 'var(--color-gold)' : 'var(--color-error)',
                }}
              >
                {couponMsg.text}
              </div>
            )}
          </div>

          {/* Breakdown Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bag Subtotal</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)' }}>
                <span>Atelier Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Express Insured Shipping</span>
              <span>{shippingFee === 0 ? <strong style={{ color: 'var(--color-gold)' }}>Complimentary</strong> : formatPrice(shippingFee)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Taxes & GST (Included)</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              <span>Total Payable</span>
              <span style={{ color: 'var(--color-gold)' }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
              icon={<ArrowRight size={18} />}
            >
              Proceed to Checkout
            </Button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '16px' }}>
            Secure checkout powered by Razorpay. 256-Bit SSL encryption.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .cart-item-row {
            grid-template-columns: 80px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
