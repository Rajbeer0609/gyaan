import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Button } from '../../components/common/Button';
import { BRAND_NAME } from '../../utils/constants';

export const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      showToast(`Welcome to the house of ${BRAND_NAME}, ${form.name}.`);
      navigate(redirectUrl);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="editorial-tag" style={{ marginBottom: '12px' }}>
            New Patron Membership
          </span>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            Join {BRAND_NAME}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Receive welcome privileges and access bespoke sartorial curations.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="Rohan Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="rohan@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Password (Min 6 Characters) *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirectUrl}`} style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
