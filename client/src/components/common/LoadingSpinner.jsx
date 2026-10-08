import React from 'react';

export const LoadingSpinner = ({ fullPage = false, message = 'Curating excellence...' }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '40px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '2px solid rgba(201, 169, 110, 0.2)',
          borderTopColor: 'var(--color-gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <p
          style={{
            fontSize: '0.85rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
