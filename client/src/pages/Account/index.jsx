import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import { authService } from '../../services/authService';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { User, Package, MapPin, Lock, LogOut, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AccountPage = () => {
  const { user, isAuthenticated, logout, updateUserState } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'profile', 'security'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // New Address State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/account');
      return;
    }

    const loadAccountData = async () => {
      try {
        setLoading(true);
        const [ordRes, addrRes] = await Promise.all([
          orderService.getUserOrders(),
          addressService.getAddresses(),
        ]);
        if (ordRes.data?.orders) setOrders(ordRes.data.orders);
        if (addrRes.data?.addresses) setAddresses(addrRes.data.addresses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile({ name: profileName, phone: profilePhone });
      updateUserState(res.data.user);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setSavingPassword(true);
      await authService.changePassword({ currentPassword, newPassword });
      showToast('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.addAddress(newAddress);
      setAddresses([res.data.address, ...addresses]);
      setShowAddressForm(false);
      showToast('New shipping address saved.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a._id !== id));
      showToast('Address removed.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await addressService.setDefaultAddress(id);
      setAddresses(res.data.addresses);
      showToast('Default delivery address updated.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderService.cancelOrder(orderId);
      setOrders(orders.map((o) => (o._id === orderId ? res.data.order : o)));
      showToast('Order cancelled and stock restored.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading member credentials..." />;

  return (
    <div className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
      <div style={{ marginBottom: '36px' }}>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Maison Client Portal
        </span>
        <h1 style={{ fontSize: '2.4rem' }}>Welcome, {user?.name}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
          Manage your orders, saved addresses, measurements, and security credentials.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '48px',
          alignItems: 'start',
        }}
        className="account-grid-layout"
      >
        {/* Left Sidebar Menu */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.9rem',
              backgroundColor: activeTab === 'orders' ? 'var(--color-bg-elevated)' : 'transparent',
              color: activeTab === 'orders' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'orders' ? 600 : 400,
              textAlign: 'left',
            }}
          >
            <Package size={18} /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.9rem',
              backgroundColor: activeTab === 'addresses' ? 'var(--color-bg-elevated)' : 'transparent',
              color: activeTab === 'addresses' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'addresses' ? 600 : 400,
              textAlign: 'left',
            }}
          >
            <MapPin size={18} /> Saved Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.9rem',
              backgroundColor: activeTab === 'profile' ? 'var(--color-bg-elevated)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'profile' ? 600 : 400,
              textAlign: 'left',
            }}
          >
            <User size={18} /> Profile Details
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.9rem',
              backgroundColor: activeTab === 'security' ? 'var(--color-bg-elevated)' : 'transparent',
              color: activeTab === 'security' ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'security' ? 600 : 400,
              textAlign: 'left',
            }}
          >
            <Lock size={18} /> Password & Security
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.9rem',
              color: 'var(--color-error)',
              textAlign: 'left',
            }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Right Tab Content */}
        <div style={{ minWidth: 0 }}>
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Order History</h2>
              {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '24px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingBottom: '16px',
                          borderBottom: '1px solid var(--color-border)',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                            {ord.orderNumber}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            Placed on {formatDate(ord.createdAt)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              backgroundColor: ord.orderStatus === 'Delivered' ? 'rgba(52, 211, 153, 0.15)' : 'var(--color-bg-elevated)',
                              color: ord.orderStatus === 'Delivered' ? 'var(--color-success)' : 'var(--color-text-primary)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            {ord.orderStatus}
                          </span>

                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {formatPrice(ord.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {ord.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: 50, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{item.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                {item.color} | {item.size} | Qty: {item.quantity}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--color-border)',
                          paddingTop: '16px',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                          Shipped to: {ord.shippingAddress?.fullName}, {ord.shippingAddress?.city}
                        </span>

                        {['Pending', 'Confirmed'].includes(ord.orderStatus) && (
                          <button
                            onClick={() => handleCancelOrder(ord._id)}
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-error)',
                              textDecoration: 'underline',
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Package size={32} />}
                  title="No Orders Yet"
                  description="When you acquire garments from our atelier, you will be able to track status and dispatch here."
                  actionText="Discover The Collection"
                  actionLink="/shop"
                />
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.6rem' }}>Delivery Addresses</h2>
                {!showAddressForm && (
                  <Button variant="primary" size="sm" onClick={() => setShowAddressForm(true)} icon={<Plus size={16} />}>
                    Add New Address
                  </Button>
                )}
              </div>

              {showAddressForm && (
                <div
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '24px',
                    marginBottom: '28px',
                  }}
                >
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>New Address</h3>
                  <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Postal Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Street / Building / House *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <Button type="submit" variant="primary">Save Address</Button>
                      <Button variant="ghost" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    style={{
                      padding: '20px',
                      backgroundColor: 'var(--color-bg-surface)',
                      border: addr.isDefault ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{addr.fullName}</span>
                        {addr.isDefault && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Default
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                        <br />
                        Phone: {addr.phone}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          style={{ fontSize: '0.78rem', color: 'var(--color-gold)' }}
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        style={{ fontSize: '0.78rem', color: 'var(--color-error)', marginLeft: 'auto' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Personal Profile</h2>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Registered Email (Read-Only)
                  </label>
                  <input type="email" disabled value={user?.email || ''} style={{ opacity: 0.6 }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="primary" loading={savingProfile}>
                  Save Changes
                </Button>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Update Password</h2>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                    New Password (Min 6 Characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="primary" loading={savingPassword}>
                  Update Password
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .account-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
