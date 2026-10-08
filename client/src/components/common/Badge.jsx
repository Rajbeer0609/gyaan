import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: size === 'sm' ? '3px 8px' : '6px 12px',
    fontSize: size === 'sm' ? '0.68rem' : '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: 'var(--radius-xs)',
    lineHeight: 1,
  };

  const variantStyles = {
    default: {
      backgroundColor: 'var(--color-bg-subtle)',
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
    },
    gold: {
      backgroundColor: 'var(--color-gold)',
      color: '#080808',
    },
    sale: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
    success: {
      backgroundColor: 'rgba(52, 211, 153, 0.15)',
      color: 'var(--color-success)',
      border: '1px solid rgba(52, 211, 153, 0.3)',
    },
    warning: {
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
      color: 'var(--color-warning)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
    },
  };

  return (
    <span style={{ ...styles, ...variantStyles[variant] }}>
      {children}
    </span>
  );
};
