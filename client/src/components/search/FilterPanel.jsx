import React from 'react';
import { SIZES, SORT_OPTIONS } from '../../utils/constants';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

export const FilterPanel = ({
  filters,
  categories = [],
  onFilterChange,
  onResetFilters,
  totalResults = 0,
}) => {
  const currentSizes = filters.size ? filters.size.split(',') : [];

  const handleSizeToggle = (sz) => {
    let nextSizes;
    if (currentSizes.includes(sz)) {
      nextSizes = currentSizes.filter((s) => s !== sz);
    } else {
      nextSizes = [...currentSizes, sz];
    }
    onFilterChange('size', nextSizes.join(','));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        paddingRight: '12px',
      }}
    >
      {/* Header & Reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-text-primary)',
          }}
        >
          Filters ({totalResults})
        </span>

        <button
          onClick={onResetFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            color: 'var(--color-gold)',
          }}
        >
          <RotateCcw size={12} /> Reset All
        </button>
      </div>

      {/* Sort Option */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '10px',
          }}
        >
          Sort By
        </label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            padding: '10px 14px',
            fontSize: '0.88rem',
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Filter */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '10px',
          }}
        >
          Gender
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['all', 'men', 'women', 'kids', 'unisex'].map((g) => {
            const isSelected = (filters.gender || 'all').toLowerCase() === g;
            return (
              <button
                key={g}
                onClick={() => onFilterChange('gender', g === 'all' ? '' : g)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: isSelected ? 'var(--color-gold)' : 'var(--color-bg-surface)',
                  color: isSelected ? '#080808' : 'var(--color-text-secondary)',
                  border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: '10px',
            }}
          >
            Category
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => onFilterChange('category', '')}
              style={{
                textAlign: 'left',
                fontSize: '0.85rem',
                color: !filters.category ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                fontWeight: !filters.category ? 600 : 400,
              }}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const isSelected = filters.category === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onFilterChange('category', isSelected ? '' : cat.slug)}
                  style={{
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    color: isSelected ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '10px',
          }}
        >
          Available Sizes
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SIZES.map((sz) => {
            const isSelected = currentSizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => handleSizeToggle(sz)}
                style={{
                  width: '42px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: isSelected ? 'var(--color-gold)' : 'var(--color-bg-surface)',
                  color: isSelected ? '#080808' : 'var(--color-text-primary)',
                  border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  fontWeight: isSelected ? 700 : 400,
                }}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '10px',
          }}
        >
          Price Ceiling (INR)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* In Stock Only Toggle */}
      <div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => onFilterChange('inStock', e.target.checked ? 'true' : '')}
            style={{ width: 'auto', accentColor: 'var(--color-gold)' }}
          />
          In Stock Only
        </label>
      </div>
    </div>
  );
};
