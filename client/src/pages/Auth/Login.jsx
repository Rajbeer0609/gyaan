import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Button } from '../../components/common/Button';
import { BRAND_NAME } from '../../utils/constants';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      showToast(`Welcome back to GYAAN, ${user.name}.`);
      if (user.role === 'admin' && redirectUrl === '/') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
          maxWidth: '440px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="editorial-tag" style={{ marginBottom: '12px' }}>
            Member Portal
          </span>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            Sign in to {BRAND_NAME}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Access orders, personal measurements, and private capsule sales.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="client@gyaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--color-gold)' }}>
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        {/* Demo Fast-fill Badges for testing convenience */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Quick Demo Autofill
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => handleFillDemo('admin@gyaan.com', 'Admin@Gyaan2026')}
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-gold-border)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--color-gold)',
              }}
            >
              Demo Admin
            </button>
            <button
              onClick={() => handleFillDemo('customer@gyaan.com', 'Customer@12345')}
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Demo Customer
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          New to GYAAN?{' '}
          <Link to={`/register?redirect=${redirectUrl}`} style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
