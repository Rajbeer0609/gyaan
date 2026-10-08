import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { useUI } from '../../context/UIContext';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const ContactPage = () => {
  const { showToast } = useUI();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    showToast('Your message has been received by our concierge.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px', maxWidth: '960px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="editorial-tag" style={{ marginBottom: '12px' }}>
          Client Concierge
        </span>
        <h1 style={{ fontSize: '2.4rem' }}>Connect With The House</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          For bespoke inquiries, order assistance, and salon appointments.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }} className="contact-grid">
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Atelier Headquarters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={20} color="var(--color-gold)" />
                <span>GYAAN Atelier, Luxury Fashion District, New Delhi, India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="var(--color-gold)" />
                <span>concierge@gyaan.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={20} color="var(--color-gold)" />
                <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="var(--color-gold)" />
                <span>Monday – Saturday: 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Direct Message</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '6px' }}>
                Message *
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" variant="primary">Send Message</Button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
