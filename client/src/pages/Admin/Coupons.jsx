import React, { useState, useEffect } from 'react';
import { couponService } from '../../services/couponService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useUI } from '../../context/UIContext';
import { formatDate } from '../../utils/formatters';
import { Plus, Trash2, Tag } from 'lucide-react';

export const AdminCouponsPage = () => {
  const { showToast } = useUI();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 2000,
    maxDiscountAmount: 1500,
    validUntil: '2030-12-31',
    perUserLimit: 1,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAllCoupons();
      if (res.data?.coupons) setCoupons(res.data.coupons);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await couponService.createCoupon(form);
      showToast(`Coupon ${form.code} created.`);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon code?')) return;
    try {
      await couponService.deleteCoupon(id);
      showToast('Coupon deleted.');
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '8px' }}>
            Promotional Instruments
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>Promotional Coupons</h1>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Issue Coupon
        </Button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              <th style={{ padding: '16px' }}>Code</th>
              <th style={{ padding: '16px' }}>Discount</th>
              <th style={{ padding: '16px' }}>Min Order</th>
              <th style={{ padding: '16px' }}>Expiry</th>
              <th style={{ padding: '16px' }}>Redemptions</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '16px', fontWeight: 700, color: 'var(--color-gold)' }}>
                  {c.code}
                </td>
                <td style={{ padding: '16px' }}>
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} off
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>
                  ₹{c.minOrderAmount}
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                  {formatDate(c.validUntil)}
                </td>
                <td style={{ padding: '16px' }}>
                  {c.usedCount} times
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(c._id)} style={{ color: 'var(--color-error)', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue New Coupon">
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Coupon Code *</label>
            <input required placeholder="LUXE20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Discount Type</label>
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed INR (₹)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Discount Value *</label>
            <input type="number" required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Min Order Amount (₹)</label>
            <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Max Discount Cap (₹)</label>
            <input type="number" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Valid Until Date *</label>
            <input type="date" required value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <Button type="submit" variant="primary">Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
