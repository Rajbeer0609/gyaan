import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { ProductGrid } from '../../components/product/ProductGrid';
import { EmptyState } from '../../components/common/EmptyState';
import { Heart } from 'lucide-react';

export const WishlistPage = () => {
  const { items, itemCount } = useWishlist();

  return (
    <div className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
      <div style={{ marginBottom: '36px' }}>
        <span className="editorial-tag" style={{ marginBottom: '8px' }}>
          Personal Archive // {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
        </span>
        <h1 style={{ fontSize: '2.4rem' }}>Your Curated Wishlist</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Pieces you have bookmarked for future private acquisition.
        </p>
      </div>

      {itemCount > 0 ? (
        <ProductGrid products={items} columns={4} />
      ) : (
        <EmptyState
          icon={<Heart size={32} />}
          title="Your Wishlist is Empty"
          description="Explore our latest editorial silhouettes, outerwear, and accessories to curate your private wardrobe."
          actionText="Discover The Collection"
          actionLink="/shop"
        />
      )}
    </div>
  );
};
