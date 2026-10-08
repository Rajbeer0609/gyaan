import React from 'react';
import { useUI } from '../../context/UIContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast, closeToast } = useUI();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        backgroundColor: 'var(--color-bg-elevated)',
        border: `1px solid ${isSuccess ? 'var(--color-gold-border)' : isError ? 'rgba(239, 68, 68, 0.4)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-xs)',
        boxShadow: '0 20px 30px rgba(0, 0, 0, 0.6)',
        color: 'var(--color-text-primary)',
        animation: 'fadeIn 0.2s ease-out',
        maxWidth: '420px',
      }}
    >
      {isSuccess && <CheckCircle size={18} color="var(--color-gold)" />}
      {isError && <AlertCircle size={18} color="var(--color-error)" />}
      {!isSuccess && !isError && <Info size={18} color="var(--color-text-secondary)" />}

      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
        {toast.message}
      </span>

      <button
        onClick={closeToast}
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-text-muted)',
          padding: 2,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
