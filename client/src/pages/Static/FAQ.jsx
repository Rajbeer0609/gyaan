import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does GYAAN sizing compare to standard global sizes?',
    a: 'Our silhouettes are designed with architectural presence. Most t-shirts, outerwear, and hoodies feature intentional relaxed drop-shoulder volumes. We recommend selecting your true size for the intended drape, or sizing down if you prefer a closer, traditional fit.',
  },
  {
    q: 'What payment modes are supported?',
    a: 'We accept all major payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, NetBanking across Indian banks, and secure digital wallets in Indian Rupees (₹).',
  },
  {
    q: 'What is your dispatch and delivery timeline?',
    a: 'Domestic orders are packed in custom archival boxes within 24 to 48 hours. Express insured delivery takes 2 to 4 business days to major metros across India, and 3 to 6 days to other regional locations.',
  },
  {
    q: 'What is the return and exchange policy?',
    a: 'We offer complimentary 7-day exchanges for size and fit on unworn garments with original security tags and packaging intact. Returns can be initiated directly from your account portal.',
  },
  {
    q: 'Are GYAAN garments limited editions?',
    a: 'Yes, the majority of our seasonal capsules and raw silk atelier drops are produced in strictly numbered, small batch runs to preserve artisanal integrity and zero textile waste.',
  },
];

export const FAQPage = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="editorial-tag" style={{ marginBottom: '12px' }}>
          Client Knowledge Base
        </span>
        <h1 style={{ fontSize: '2.4rem' }}>Frequently Asked Questions</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: isOpen ? 'var(--color-gold)' : 'var(--color-text-primary)',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-fast)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 24px 24px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid var(--color-border-subtle)',
                    paddingTop: '16px',
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
