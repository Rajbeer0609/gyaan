import React, { useState } from 'react';

export const ProductGallery = ({ images = [], productName = 'Product' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          paddingTop: '133%',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-sm)',
        }}
      />
    );
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main Image with Zoom Container */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '125%', // 4:5 fashion aspect
          backgroundColor: '#121212',
          overflow: 'hidden',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          cursor: 'crosshair',
        }}
      >
        <img
          src={images[activeIndex]}
          alt={`${productName} view ${activeIndex + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.15s ease-out',
            transform: zoomStyle.display === 'block' ? 'scale(1.8)' : 'scale(1)',
            transformOrigin: zoomStyle.transformOrigin || 'center',
          }}
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: '74px',
                height: '92px',
                flexShrink: 0,
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                border: idx === activeIndex ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                padding: 0,
                opacity: idx === activeIndex ? 1 : 0.6,
                transition: 'all var(--transition-fast)',
              }}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
