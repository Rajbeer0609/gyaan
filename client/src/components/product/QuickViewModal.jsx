import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ProductGallery } from './ProductGallery';
import { Heart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, showToast } = useUI();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors?.[0]?.name || '');
      setSelectedSize(quickViewProduct.sizes?.[0] || '');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const inWishlist = isInWishlist(quickViewProduct._id);

  // Variant matching
  const activeVariant = quickViewProduct.variants?.find(
    (v) =>
      v.color.toLowerCase() === selectedColor.toLowerCase() &&
      v.size.toLowerCase() === selectedSize.toLowerCase()
  );

  const availableStock = activeVariant
    ? activeVariant.stock
    : quickViewProduct.totalStock;

  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      showToast('Please select color and size.', 'error');
      return;
    }
    if (isOutOfStock) {
      showToast('Selected variant is out of stock.', 'error');
      return;
    }

    try {
      setAdding(true);
      await addToCart(quickViewProduct, selectedColor, selectedSize, quantity);
      showToast(`Added ${quickViewProduct.name} (${selectedColor}/${selectedSize}) to bag.`);
      setQuickViewProduct(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(quickViewProduct)}
      onClose={() => setQuickViewProduct(null)}
      title="Quick Atelier View"
      maxWidth="880px"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
        }}
      >
        {/* Left: Gallery */}
        <div>
          <ProductGallery
            images={quickViewProduct.images}
            productName={quickViewProduct.name}
          />
        </div>

        {/* Right: Details & Variant Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
              }}
            >
              {quickViewProduct.category?.name || 'GYAAN Atelier'}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                margin: '6px 0 12px',
                color: 'var(--color-text-primary)',
              }}
            >
              {quickViewProduct.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                {formatPrice(quickViewProduct.price)}
              </span>
              {quickViewProduct.compareAtPrice > quickViewProduct.price && (
                <span
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatPrice(quickViewProduct.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {quickViewProduct.shortDescription}
          </p>

          {/* Color Selector */}
          {quickViewProduct.colors?.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '10px',
                }}
              >
                Color: <span style={{ color: 'var(--color-text-primary)' }}>{selectedColor}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {quickViewProduct.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: selectedColor === c.name ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                      outline: selectedColor === c.name ? '2px solid rgba(201, 169, 110, 0.4)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {quickViewProduct.sizes?.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.78rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '10px',
                }}
              >
                Size: <span style={{ color: 'var(--color-text-primary)' }}>{selectedSize}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {quickViewProduct.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: selectedSize === sz ? 'var(--color-gold)' : 'var(--color-bg-elevated)',
                      color: selectedSize === sz ? '#080808' : 'var(--color-text-primary)',
                      border: selectedSize === sz ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                      fontWeight: selectedSize === sz ? 700 : 500,
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div style={{ fontSize: '0.82rem' }}>
            {isOutOfStock ? (
              <span style={{ color: 'var(--color-error)' }}>Out of Stock</span>
            ) : availableStock <= 5 ? (
              <span style={{ color: 'var(--color-warning)' }}>
                Low Stock — Only {availableStock} garments remaining
              </span>
            ) : (
              <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> In Stock ({availableStock} available)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <Button
              variant="primary"
              fullWidth
              disabled={isOutOfStock}
              loading={adding}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleWishlist(quickViewProduct)}
              style={{ width: '50px', padding: 0 }}
              title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={18} fill={inWishlist ? 'var(--color-gold)' : 'none'} color={inWishlist ? 'var(--color-gold)' : 'currentColor'} />
            </Button>
          </div>

          <Link
            to={`/products/${quickViewProduct.slug}`}
            onClick={() => setQuickViewProduct(null)}
            style={{
              textAlign: 'center',
              fontSize: '0.82rem',
              color: 'var(--color-gold)',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
            }}
          >
            View Full Architectural Specifications & Reviews
          </Link>
        </div>
      </div>
    </Modal>
  );
};
