import React from 'react';
import { useLocation } from 'react-router-dom';
import { BRAND_NAME } from '../../utils/constants';

export const PoliciesPage = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Maison Policies';
  let content = null;

  if (path.includes('shipping')) {
    title = 'Shipping & Delivery Policy';
    content = (
      <>
        <p>
          At {BRAND_NAME}, each garment is handled with couture precision. All orders placed are verified and prepared at our atelier within 24 to 48 business hours.
        </p>
        <h3>Shipping Rates & Transit Windows</h3>
        <p>
          • <strong>Complimentary Express Shipping:</strong> Available on all domestic orders across India exceeding ₹2,500.
          <br />
          • <strong>Standard Shipping:</strong> A flat handling fee of ₹250 applies to orders below ₹2,500.
          <br />
          • <strong>Transit Duration:</strong> Metro cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata) typically receive deliveries within 2–4 business days. Regional destinations are delivered in 4–6 business days.
        </p>
        <h3>Courier Partners & Insurance</h3>
        <p>
          We partner exclusively with premium express courier networks. Every parcel is dispatched in sealed, tamper-evident archival boxes with full transit insurance coverage until doorstep handover.
        </p>
      </>
    );
  } else if (path.includes('returns')) {
    title = 'Returns, Exchanges & Refund Policy';
    content = (
      <>
        <p>
          We want you to be completely satisfied with your {BRAND_NAME} garment. If a piece does not fit as envisioned, our concierge is at your service.
        </p>
        <h3>7-Day Exchange Window</h3>
        <p>
          You may request an exchange for size or alternative color within 7 days of verified delivery. The garment must be unworn, unwashed, unaltered, and accompanied by the original woven tags, custom packaging, and receipt.
        </p>
        <h3>Refund Processing</h3>
        <p>
          Upon return inspection at our facility, refunds are approved within 48 hours and credited back to the original payment source (Razorpay / UPI / Card) within 5–7 banking days.
        </p>
      </>
    );
  } else if (path.includes('privacy')) {
    title = 'Privacy & Data Protection Policy';
    content = (
      <>
        <p>
          {BRAND_NAME} is committed to the utmost confidentiality and discretion regarding client personal information.
        </p>
        <h3>Information We Collect</h3>
        <p>
          We collect standard credentials required to deliver bespoke services: name, delivery address, contact phone number, and email. Financial transaction data (such as card numbers and UPI pins) are processed directly by RBI-authorized payment aggregator Razorpay through 256-bit encrypted channels and never stored on our servers.
        </p>
        <h3>Data Usage & No Third-Party Sales</h3>
        <p>
          We do not sell, rent, or monetize client records to external marketing entities. Your data is used strictly for order fulfillment, dispatch updates, and private maison announcements if subscribed.
        </p>
      </>
    );
  } else {
    title = 'Terms & Conditions of Service';
    content = (
      <>
        <p>
          By accessing and placing orders on the {BRAND_NAME} digital storefront, you agree to comply with our terms and standards of conduct.
        </p>
        <h3>Intellectual Property</h3>
        <p>
          All silhouettes, architectural garment photography, trademarks, brand insignia, typography, and website code are the exclusive intellectual property of {BRAND_NAME} Atelier.
        </p>
        <h3>Pricing & Currency</h3>
        <p>
          All prices on the platform are stated in Indian Rupees (₹) inclusive of applicable goods and services tax (GST). We reserve the right to revise catalog pricing, capsule quantities, and promotions at our discretion.
        </p>
      </>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px', maxWidth: '800px' }}>
      <span className="editorial-tag" style={{ marginBottom: '12px' }}>
        Legal & Standards
      </span>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '32px' }}>{title}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--color-text-secondary)', fontSize: '0.96rem', lineHeight: 1.8 }}>
        {content}
      </div>
    </div>
  );
};
