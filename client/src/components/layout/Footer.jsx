import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND_NAME } from '../../utils/constants';
import { ArrowRight, Check } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '80px',
        paddingBottom: '40px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Upper Editorial Newsletter Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px',
            paddingBottom: '64px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <span className="editorial-tag" style={{ marginBottom: '16px' }}>
              The Maison Dispatch
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                marginBottom: '12px',
                color: 'var(--color-text-primary)',
              }}
            >
              Curated Invitations & Private Previews
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '440px' }}>
              Subscribe to receive exclusive access to capsule releases, private salon previews, and sartorial notes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {subscribed ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--color-gold)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                <Check size={20} />
                <span>You have been subscribed to the private dispatch.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                style={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: '460px',
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    borderRight: 'none',
                    borderRadius: 'var(--radius-xs) 0 0 var(--radius-xs)',
                    padding: '14px 18px',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--color-gold)',
                    color: '#080808',
                    padding: '0 24px',
                    borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color var(--transition-fast)',
                  }}
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px',
            paddingTop: '64px',
            paddingBottom: '64px',
          }}
        >
          {/* Brand Col */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                letterSpacing: '0.2em',
                marginBottom: '16px',
                color: 'var(--color-text-primary)',
              }}
            >
              {BRAND_NAME}
            </h4>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                lineHeight: 1.7,
                maxWidth: '240px',
              }}
            >
              A luxury fashion house rooted in contemporary poise, enduring silhouettes, and purposeful craftsmanship.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h5
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '20px',
              }}
            >
              Collections
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/shop?gender=men" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Men's Wardrobe</Link></li>
              <li><Link to="/shop?gender=women" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Women's Collection</Link></li>
              <li><Link to="/shop?gender=unisex" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Unisex Atelier</Link></li>
              <li><Link to="/shop?gender=kids" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>GYAAN Junior</Link></li>
              <li><Link to="/shop?newArrival=true" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>New Arrivals</Link></li>
              <li><Link to="/shop?onSale=true" style={{ color: 'var(--color-error)', fontSize: '0.88rem' }}>The Archive Sale</Link></li>
            </ul>
          </div>

          {/* The House */}
          <div>
            <h5
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '20px',
              }}
            >
              The Maison
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/about" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>About GYAAN</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Concierge & Contact</Link></li>
              <li><Link to="/faq" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Client Assistance & FAQ</Link></li>
              <li><Link to="/account/orders" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Track Order</Link></li>
            </ul>
          </div>

          {/* Client Policies */}
          <div>
            <h5
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                marginBottom: '20px',
              }}
            >
              Client Care
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/policies/shipping" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Shipping Policy</Link></li>
              <li><Link to="/policies/returns" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Returns & Exchanges</Link></li>
              <li><Link to="/policies/privacy" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Privacy Policy</Link></li>
              <li><Link to="/policies/terms" style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '32px',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} {BRAND_NAME} Atelier. All rights reserved. Prices displayed in Indian Rupee (₹).
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Complimentary Domestic Shipping on ₹2,500+</span>
            <span>Secure Razorpay 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
