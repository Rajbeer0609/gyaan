import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { Badge } from '../common/Badge';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { setQuickViewProduct, showToast } = useUI();

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  const hoverImage = product.images?.[1] || mainImage;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to first variant color & size
    const color = product.colors?.[0]?.name || product.variants?.[0]?.color || 'Standard';
    const size = product.sizes?.[0] || product.variants?.[0]?.size || 'M';

    try {
      await addToCart(product, color, size, 1);
      showToast(`Added ${product.name} to cart.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-xs)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        transition: 'border-color var(--transition-fast), transform var(--transition-smooth)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* Product Image Container */}
      <Link
        to={`/products/${product.slug}`}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          paddingTop: '133%', // 3:4 high-fashion aspect ratio
          backgroundColor: '#141414',
          overflow: 'hidden',
        }}
      >
        <img
          src={isHovered ? hoverImage : mainImage}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />

        {/* Badges: Sale, New Arrival, Best Seller */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {product.isOnSale && product.discountPercentage > 0 && (
            <Badge variant="sale">-{product.discountPercentage}%</Badge>
          )}
          {product.isNewArrival && !product.isOnSale && (
            <Badge variant="gold">New</Badge>
          )}
          {product.isBestSeller && !product.isOnSale && !product.isNewArrival && (
            <Badge variant="default">Iconic</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 2,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(10, 10, 10, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: inWishlist ? 'var(--color-gold)' : 'var(--color-text-primary)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Heart size={16} fill={inWishlist ? 'var(--color-gold)' : 'none'} />
        </button>

        {/* Hover Action Bar: Quick View & Quick Add */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'rgba(10, 10, 10, 0.92)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 2,
          }}
        >
          <button
            onClick={handleQuickView}
            style={{
              padding: '12px 8px',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--color-text-secondary)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Eye size={14} /> Quick View
          </button>
          <button
            onClick={handleQuickAdd}
            style={{
              padding: '12px 8px',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--color-gold)',
              fontWeight: 600,
            }}
          >
            <ShoppingBag size={14} /> Quick Add
          </button>
        </div>
      </Link>

      {/* Product Details Section */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          {product.category?.name || product.brand || 'GYAAN'}
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.94rem',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.8em',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price & Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--color-gold)',
              }}
            >
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice > product.price && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'line-through',
                }}
              >
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.rating > 0 && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>★</span>
              <span>{product.rating}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
