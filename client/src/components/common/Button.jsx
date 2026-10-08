import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md',        // 'sm', 'md', 'lg'
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    borderRadius: 'var(--radius-xs)',
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '0.75rem' },
    md: { padding: '13px 26px', fontSize: '0.85rem' },
    lg: { padding: '16px 36px', fontSize: '0.92rem' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-gold)',
      color: '#080808',
      border: '1px solid var(--color-gold)',
      fontWeight: 600,
    },
    secondary: {
      backgroundColor: 'var(--color-bg-elevated)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: 'var(--color-error)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={combinedStyles}
      className={`gyaan-btn ${className}`}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
