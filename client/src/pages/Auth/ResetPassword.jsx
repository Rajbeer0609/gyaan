import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useUI } from '../../context/UIContext';
import { Button } from '../../components/common/Button';

export const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) {
      showToast('Token and new password are required.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({ token, newPassword });
      showToast('Your password has been updated. Please sign in with your new password.');
      navigate('/login');
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
          Create New Password
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Enter the reset token sent to your email and your new password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Reset Token *
            </label>
            <input
              type="text"
              required
              placeholder="Paste 64-character token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              New Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Update Password
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: 'var(--color-text-muted)' }}>← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};
