import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { formatPrice } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useUI } from '../../context/UIContext';
import { Plus, Edit2, Trash2, Search, Check, AlertCircle } from 'lucide-react';

export const AdminProductsPage = () => {
  const { showToast } = useUI();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    gender: 'unisex',
    price: '',
    compareAtPrice: '',
    images: '',
    brand: 'GYAAN Atelier',
    material: '100% Combed Cotton',
    fabric: 'Heavyweight Loopback',
    totalStock: 50,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories(),
      ]);
      if (prodRes.data?.products) setProducts(prodRes.data.products);
      if (catRes.data?.categories) setCategories(catRes.data.categories);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      shortDescription: '',
      description: '',
      category: categories[0]?._id || '',
      gender: 'unisex',
      price: '',
      compareAtPrice: '',
      images: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      brand: 'GYAAN Atelier',
      material: '100% Combed Cotton',
      fabric: 'Heavyweight Loopback',
      totalStock: 50,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isOnSale: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      category: p.category?._id || p.category || '',
      gender: p.gender,
      price: p.price,
      compareAtPrice: p.compareAtPrice || '',
      images: p.images?.join('\n') || '',
      brand: p.brand || 'GYAAN',
      material: p.material || '',
      fabric: p.fabric || '',
      totalStock: p.totalStock || 0,
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      isBestSeller: Boolean(p.isBestSeller),
      isOnSale: Boolean(p.isOnSale),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const imagesArray = form.images
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : 0,
        totalStock: Number(form.totalStock),
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        showToast('Product updated successfully.');
      } else {
        await productService.createProduct(payload);
        showToast('New luxury product cataloged.');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to retire this product from catalog?')) return;
    try {
      await productService.deleteProduct(id);
      showToast('Product retired.');
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.gender.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '8px' }}>
            Catalog Administration
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>Product Management</h1>
        </div>

        <Button variant="primary" onClick={openAddModal} icon={<Plus size={16} />}>
          Add New Garment
        </Button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', maxWidth: '400px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Filter catalog by name or gender..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-muted)' }} />
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              <th style={{ padding: '16px' }}>Garment</th>
              <th style={{ padding: '16px' }}>Category</th>
              <th style={{ padding: '16px' }}>Gender</th>
              <th style={{ padding: '16px' }}>Price</th>
              <th style={{ padding: '16px' }}>Stock</th>
              <th style={{ padding: '16px' }}>Flags</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.sku || p.slug}</div>
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>
                  {p.category?.name || 'Standard'}
                </td>
                <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                  {p.gender}
                </td>
                <td style={{ padding: '16px', color: 'var(--color-gold)', fontWeight: 600 }}>
                  {formatPrice(p.price)}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ color: p.totalStock <= 5 ? 'var(--color-warning)' : 'inherit', fontWeight: p.totalStock <= 5 ? 700 : 400 }}>
                    {p.totalStock} units
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {p.isFeatured && <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: 2 }}>Feat</span>}
                    {p.isBestSeller && <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-gold-muted)', color: 'var(--color-gold)', padding: '2px 6px', borderRadius: 2 }}>Best</span>}
                    {p.isOnSale && <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: 2 }}>Sale</span>}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button
                    onClick={() => openEditModal(p)}
                    style={{ padding: 6, color: 'var(--color-text-secondary)', marginRight: 8 }}
                    title="Edit Garment"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    style={{ padding: 6, color: 'var(--color-error)' }}
                    title="Retire Garment"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Silhouette' : 'Catalog New Garment'}
        maxWidth="760px"
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Product Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Target Gender *</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Price (INR ₹) *</label>
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Compare At Price (INR ₹)</label>
            <input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Total Stock Reserve *</label>
            <input type="number" required value={form.totalStock} onChange={(e) => setForm({ ...form, totalStock: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Brand Label</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Image URLs (One per line) *</label>
            <textarea rows={3} required value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Short Description *</label>
            <input required value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>Detailed Sartorial Description *</label>
            <textarea rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px', flexWrap: 'wrap', paddingTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 'auto' }} />
              Featured Piece
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} style={{ width: 'auto' }} />
              New Arrival
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} style={{ width: 'auto' }} />
              Best Seller
            </label>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="submit" variant="primary" loading={saving}>
              {editingProduct ? 'Save Updates' : 'Add to Catalog'}
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
