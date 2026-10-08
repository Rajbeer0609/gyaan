import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products, columns = 4 }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px',
        width: '100%',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
