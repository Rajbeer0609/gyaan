import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ProductGrid } from '../../components/product/ProductGrid';
import { FilterPanel } from '../../components/search/FilterPanel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { SlidersHorizontal, X } from 'lucide-react';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filters from searchParams
  const currentFilters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    sort: searchParams.get('sort') || 'newest',
    inStock: searchParams.get('inStock') || '',
    featured: searchParams.get('featured') || '',
    newArrival: searchParams.get('newArrival') || '',
    bestSeller: searchParams.get('bestSeller') || '',
    onSale: searchParams.get('onSale') || '',
    page: searchParams.get('page') || '1',
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = { ...currentFilters, limit: 12 };
        // Remove empty keys
        Object.keys(queryParams).forEach((k) => {
          if (!queryParams[k]) delete queryParams[k];
        });

        const res = await productService.getProducts(queryParams);
        if (res.data) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  // Determine page title
  let pageTitle = 'The Complete Collection';
  if (currentFilters.gender) {
    pageTitle = `${currentFilters.gender.charAt(0).toUpperCase() + currentFilters.gender.slice(1)}'s Wardrobe`;
  } else if (currentFilters.category) {
    const matched = categories.find((c) => c.slug === currentFilters.category);
    pageTitle = matched ? matched.name : 'Category Collection';
  } else if (currentFilters.onSale) {
    pageTitle = 'The Archive Sale';
  } else if (currentFilters.newArrival) {
    pageTitle = 'New Arrivals';
  } else if (currentFilters.search) {
    pageTitle = `Search Results: "${currentFilters.search}"`;
  }

  return (
    <div className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
      {/* Title & Mobile Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span className="editorial-tag" style={{ marginBottom: '8px' }}>
            Catalog // GYAAN Atelier
          </span>
          <h1 style={{ fontSize: '2.4rem', textTransform: 'capitalize' }}>
            {pageTitle}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            Showing {pagination.total} garments crafted with uncompromising precision.
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="mobile-filter-trigger"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.85rem',
            color: 'var(--color-text-primary)',
          }}
        >
          <SlidersHorizontal size={16} /> Filters & Sort
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '48px',
          alignItems: 'start',
        }}
        className="shop-layout-grid"
      >
        {/* Desktop Left Sidebar: FilterPanel */}
        <aside className="shop-sidebar">
          <FilterPanel
            filters={currentFilters}
            categories={categories}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={pagination.total}
          />
        </aside>

        {/* Right Content Area: Product Grid */}
        <div style={{ minWidth: 0 }}>
          {loading ? (
            <LoadingSpinner fullPage />
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} columns={3} />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '64px',
                  }}
                >
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => handlePageChange(pg)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: pg === pagination.page ? 'var(--color-gold)' : 'var(--color-bg-surface)',
                        color: pg === pagination.page ? '#080808' : 'var(--color-text-secondary)',
                        border: pg === pagination.page ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                        fontWeight: pg === pagination.page ? 700 : 500,
                        fontSize: '0.88rem',
                      }}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No garments match your filters"
              description="Adjust your size, color, or category criteria to explore our other atelier pieces."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
          }}
        >
          <div
            onClick={() => setMobileFilterOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '85%',
              maxWidth: '380px',
              height: '100%',
              backgroundColor: 'var(--color-bg-surface)',
              borderRight: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              padding: '24px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '1.1rem' }}>Filter & Sort</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              filters={currentFilters}
              categories={categories}
              onFilterChange={(k, v) => {
                handleFilterChange(k, v);
                setMobileFilterOpen(false);
              }}
              onResetFilters={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
              totalResults={pagination.total}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .shop-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .shop-sidebar {
            display: none !important;
          }
          .mobile-filter-trigger {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
