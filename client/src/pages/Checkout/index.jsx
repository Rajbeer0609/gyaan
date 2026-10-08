import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { addressService } from '../../services/addressService';
import { paymentService } from '../../services/paymentService';
import { orderService } from '../../services/orderService';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CheckCircle, Shield, Plus, ArrowRight, Lock } from 'lucide-react';

export const CheckoutPage = () => {
  const { items, subtotal, shippingFee, discountAmount, tax, grandTotal, coupon, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Address form fields
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    if (isAuthenticated) {
      const fetchAddresses = async () => {
        try {
          const res = await addressService.getAddresses();
          if (res.data?.addresses?.length > 0) {
            setAddresses(res.data.addresses);
            const defaultAddr = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
            setSelectedAddressId(defaultAddr._id);
          } else {
            setShowNewAddressForm(true);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchAddresses();
    } else {
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated, items]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) {
      showToast('Please fill all mandatory shipping address fields.', 'error');
      return;
    }

    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await addressService.addAddress(addressForm);
        setAddresses([res.data.address, ...addresses]);
        setSelectedAddressId(res.data.address._id);
        setShowNewAddressForm(false);
        showToast('Shipping address saved.');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      setShowNewAddressForm(false);
    }
  };

  const getActiveShippingAddress = () => {
    if (isAuthenticated && selectedAddressId) {
      const found = addresses.find((a) => a._id === selectedAddressId);
      if (found) return found;
    }
    return addressForm;
  };

  // RAZORPAY PAYMENT FLOW
  const handleRazorpayPayment = async () => {
    const shippingAddress = getActiveShippingAddress();

    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.phone) {
      showToast('Please provide a complete shipping address.', 'error');
      setShowNewAddressForm(true);
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in or create an account to complete your luxury order.', 'error');
      navigate('/login?redirect=/checkout');
      return;
    }

    try {
      setProcessingPayment(true);

      // Prepare order items
      const orderItems = items.map((i) => ({
        product: i.product?._id || i.product,
        name: i.product?.name || i.name || 'Garment',
        image: i.product?.images?.[0] || i.image || '',
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        price: i.price || i.product?.price || 0,
      }));

      // Step 1: Create Razorpay Order on server
      const paymentOrderRes = await paymentService.createPaymentOrder(grandTotal, orderItems);
      const { orderId, amount, currency, keyId, isMock } = paymentOrderRes.data;

      // Handle Sandbox / Mock simulation mode or standard Razorpay checkout
      if (isMock || !window.Razorpay) {
        // Test payment simulation
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `sig_mock_${Date.now()}`;

        // Verify on server
        await paymentService.verifyPayment({
          razorpayOrderId: orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        });

        // Create confirmed order
        const orderRes = await orderService.createOrder({
          items: orderItems,
          shippingAddress,
          subtotal,
          discount: discountAmount,
          shippingFee,
          tax,
          total: grandTotal,
          couponCode: coupon?.code || null,
          paymentMethod: 'razorpay',
          razorpayOrderId: orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        });

        clearCart();
        navigate(`/order-confirmation/${orderRes.data.order._id}`);
        return;
      }

      // Step 2: Open standard Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'GYAAN Atelier',
        description: 'Payment for luxury fashion order',
        order_id: orderId,
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email || user.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#c9a96e',
        },
        handler: async function (response) {
          try {
            // Step 3: Server-side cryptographic signature verification
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Step 4: Create final confirmed order
            const orderRes = await orderService.createOrder({
              items: orderItems,
              shippingAddress,
              subtotal,
              discount: discountAmount,
              shippingFee,
              tax,
              total: grandTotal,
              couponCode: coupon?.code || null,
              paymentMethod: 'razorpay',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            navigate(`/order-confirmation/${orderRes.data.order._id}`);
          } catch (verErr) {
            showToast(`Payment verification error: ${verErr.message}`, 'error');
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            showToast('Payment window closed.', 'error');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      showToast(err.message, 'error');
      setProcessingPayment(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
      <div style={{ marginBottom: '32px' }}>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Final Checkout Step
        </span>
        <h1 style={{ fontSize: '2.4rem' }}>Express Atelier Checkout</h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(280px, 1.2fr)',
          gap: '48px',
          alignItems: 'start',
        }}
        className="checkout-layout-grid"
      >
        {/* Left Column: Delivery Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Saved Addresses List */}
          {isAuthenticated && addresses.length > 0 && !showNewAddressForm && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Select Delivery Address</h3>
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--color-gold)',
                    fontSize: '0.85rem',
                  }}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      style={{
                        padding: '18px',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr._id)}
                        style={{ width: 'auto', marginTop: 4, accentColor: 'var(--color-gold)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                          {addr.fullName} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({addr.phone})</span>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Address Form */}
          {showNewAddressForm && (
            <div
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Shipping Address</h3>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddressForm(false)}
                    style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleAddNewAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Address Line 1 (House No., Building, Street) *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Address Line 2 (Apartment, Floor, Landmark)
                  </label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Country
                  </label>
                  <input type="text" disabled value="India" />
                </div>

                {isAuthenticated && (
                  <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <Button type="submit" variant="secondary" loading={loading}>
                      Save Address
                    </Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Payment Method Badge */}
          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Shield size={28} color="var(--color-gold)" />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>
                Razorpay Payment Gateway
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Supports UPI (GPay, PhonePe, Paytm), Credit Cards, Debit Cards, NetBanking.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
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
              marginBottom: '20px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '16px',
            }}
          >
            Order Review ({items.length})
          </h3>

          {/* Items review snippet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', maxHeight: '200px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-secondary)', maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.quantity}x {item.product?.name || item.name} ({item.size})
                </span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)' }}>
                <span>Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Insured Shipping</span>
              <span>{shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              <span>Total Payable</span>
              <span style={{ color: 'var(--color-gold)' }}>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div style={{ marginTop: '28px' }}>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={processingPayment}
              onClick={handleRazorpayPayment}
              icon={<Lock size={16} />}
            >
              Pay {formatPrice(grandTotal)} with Razorpay
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
