import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useUI } from '../../context/UIContext';
import { Plus, Trash2, Edit2, Layers } from 'lucide-react';

export const AdminCategoriesPage = () => {
  const { showToast } = useUI();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', gender: 'all' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.data?.categories) setCategories(res.data.categories);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      gender: 'all',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      gender: cat.gender || 'all',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, form);
        showToast('Category updated.');
      } else {
        await categoryService.createCategory(form);
        showToast('Dynamic category created.');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      showToast('Category removed.');
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <span className="editorial-tag" style={{ marginBottom: '8px' }}>
            Taxonomy Architecture
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>Dynamic Categories</h1>
        </div>

        <Button variant="primary" onClick={openAddModal} icon={<Plus size={16} />}>
          Add Category
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {categories.map((cat) => (
          <div
            key={cat._id}
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(8, 8, 8, 0.75)',
                  backdropFilter: 'blur(4px)',
                  padding: '3px 8px',
                  borderRadius: 2,
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                }}
              >
                {cat.gender}
              </span>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{cat.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', flex: 1, lineHeight: 1.5 }}>
                {cat.description || 'No description entered.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Slug: {cat.slug}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(cat)} style={{ color: 'var(--color-text-secondary)', padding: 4 }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} style={{ color: 'var(--color-error)', padding: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Dynamic Category'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Category Name *
            </label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Gender Targeting
            </label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="all">All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Hero Image URL
            </label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '4px' }}>
              Description
            </label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <Button type="submit" variant="primary" loading={saving}>
            {editingCategory ? 'Save Updates' : 'Create Category'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
