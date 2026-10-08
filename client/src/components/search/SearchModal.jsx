import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';

const POPULAR_SEARCHES = [
  'Oversized Heavyweight Tee',
  'Architectural Pleated Trousers',
  'Double-Breasted Wool Overcoat',
  'Pure Mulberry Silk Dress',
  'Japanese Selvedge Denim',
  'Calfskin Leather Boots',
];

export const SearchModal = () => {
  const { searchModalOpen, setSearchModalOpen } = useUI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('gyaan_recent_searches');
    return saved ? JSON.parse(saved) : ['Black Tee', 'Silk Dress', 'Trousers'];
  });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [searchModalOpen]);

  // Debounced search preview
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ search: query.trim(), limit: 4 });
        if (res.data?.products) {
          setResults(res.data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchModalOpen) return null;

  const close = () => {
    setSearchModalOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleSearchSubmit = (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;

    // Add to recent
    const updated = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('gyaan_recent_searches', JSON.stringify(updated));

    close();
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(8, 8, 8, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
    >
      <div className="container" style={{ width: '100%', maxWidth: '840px', paddingTop: '40px' }}>
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '16px',
            gap: '16px',
          }}
        >
          <Search size={28} color="var(--color-gold)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by silhouette, fabric, category, or tone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
              if (e.key === 'Escape') close();
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-text-primary)',
              padding: 0,
              boxShadow: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--color-text-muted)', padding: 4 }}
            >
              <X size={20} />
            </button>
          )}
          <button
            onClick={close}
            style={{
              padding: '6px 12px',
              fontSize: '0.82rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
            }}
          >
            ESC
          </button>
        </div>

        {/* Live Results or Suggestions */}
        <div style={{ marginTop: '40px', overflowY: 'auto', maxHeight: '70vh' }}>
          {query.trim().length >= 2 ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {loading ? 'Searching catalog...' : `${results.length} Suggestions`}
                </span>
                <button
                  onClick={() => handleSearchSubmit()}
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all results <ArrowRight size={14} />
                </button>
              </div>

              {results.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        close();
                        navigate(`/products/${product.slug}`);
                      }}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        overflow: 'hidden',
                        transition: 'transform var(--transition-fast)',
                      }}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '12px' }}>
                        <h4
                          style={{
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginBottom: '4px',
                          }}
                        >
                          {product.name}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !loading ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  No editorial garments found matching "{query}". Try searching for categories like "wool", "silk", "dress", or "black".
                </p>
              ) : null}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* Popular Searches */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--color-gold)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                >
                  <TrendingUp size={16} /> Popular Searches
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {POPULAR_SEARCHES.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSearchSubmit(item)}
                      style={{
                        textAlign: 'left',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.92rem',
                        transition: 'color var(--transition-fast)',
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                >
                  <Clock size={16} /> Recent Searches
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSearchSubmit(item)}
                      style={{
                        textAlign: 'left',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.92rem',
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
