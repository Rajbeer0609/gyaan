import React from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon,
  title = 'No items found',
  description = 'There are currently no items matching your criteria in the GYAAN collection.',
  actionText = 'Discover Collection',
  actionLink = '/shop',
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        maxWidth: '540px',
        margin: '0 auto',
      }}
    >
      {icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-gold)',
            marginBottom: '24px',
            border: '1px solid var(--color-border)',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.75rem',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.95rem',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {onAction ? (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      ) : actionLink ? (
        <Link to={actionLink}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      ) : null}
    </div>
  );
};
