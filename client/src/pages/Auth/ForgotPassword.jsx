import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useUI } from '../../context/UIContext';
import { Button } from '../../components/common/Button';
import { CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenHint, setTokenHint] = useState(null);
  const [sent, setSent] = useState(false);
  const { showToast } = useUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      setSent(true);
      showToast('Password reset token generated.');
      if (res.data?.resetToken) {
        setTokenHint(res.data.resetToken);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', padding: '40px' }}>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
          Reset Password
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Enter your registered email address and we will provide credentials to reset your password.
        </p>

        {sent ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', marginBottom: '16px' }}>
              <CheckCircle2 size={20} />
              <span>Password reset instructions issued.</span>
            </div>
            {tokenHint && (
              <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', wordBreak: 'break-all', marginBottom: '20px' }}>
                <strong>Dev Reset Token:</strong> {tokenHint}
              </div>
            )}
            <Link to="/reset-password">
              <Button variant="primary" fullWidth>Proceed to Enter New Password</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gyaan.com"
              />
            </div>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Request Reset Token
            </Button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: 'var(--color-text-muted)' }}>← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};
