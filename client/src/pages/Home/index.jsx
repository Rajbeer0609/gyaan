import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Compass, Truck } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, newRes, catRes] = await Promise.all([
          productService.getProducts({ featured: 'true', limit: 4 }),
          productService.getProducts({ newArrival: 'true', limit: 8 }),
          categoryService.getCategories(),
        ]);

        if (featRes.data?.products) setFeaturedProducts(featRes.data.products);
        if (newRes.data?.products) setNewArrivals(newRes.data.products);
        if (catRes.data?.categories) setCategories(catRes.data.categories.slice(0, 4));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '96px', paddingBottom: '96px' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          backgroundColor: '#0a0a0a',
        }}
      >
        {/* Background Editorial Image with Dim Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85')`,
            backgroundPosition: 'center 28%',
            backgroundSize: 'cover',
            filter: 'brightness(0.32) contrast(1.1)',
            transform: 'scale(1.02)',
          }}
        />

        {/* Ambient Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.4) 60%, rgba(8,8,8,0.7) 100%)',
          }}
        />

        {/* Hero Content */}
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '920px',
            padding: '40px 24px',
          }}
        >
          <span
            className="editorial-tag"
            style={{ marginBottom: '24px', letterSpacing: '0.24em' }}
          >
            Edition 2026 // Modern Luxury
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.8rem, 7vw, 5.2rem)',
              lineHeight: 1.08,
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
            }}
          >
            Sculptural Elegance. <br />
            <span style={{ fontStyle: 'italic', color: 'var(--color-gold)' }}>
              Enduring Form.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--color-text-secondary)',
              maxWidth: '620px',
              margin: '0 auto 40px',
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            GYAAN creates elevated clothing defined by architectural lines, heavyweight fabrics, and uncompromising attention to detail.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '18px',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/shop">
              <Button variant="primary" size="lg">
                Shop Now
              </Button>
            </Link>
            <Link to="/shop?featured=true">
              <Button variant="outline" size="lg">
                Explore Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PILLARS */}
      <section className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
            padding: '36px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Compass size={24} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Bespoke Craftsmanship
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Constructed using 300+ GSM combed fibers, French terry, and Italian poplins.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Truck size={24} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Complimentary Shipping
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Express doorstep delivery across India on orders exceeding ₹2,500.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Shield size={24} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Seamless Exchanges
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Client concierge team dedicated to 7-day hassle-free size swaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span className="editorial-tag" style={{ marginBottom: '12px' }}>
              The Fresh Perspective
            </span>
            <h2 style={{ fontSize: '2.4rem' }}>New Arrivals</h2>
          </div>
          <Link
            to="/shop?newArrival=true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-gold)',
              fontSize: '0.88rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            View All ({newArrivals.length}) <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <ProductGrid products={newArrivals} />
        )}
      </section>

      {/* 4. EDITORIAL HERO BANNER */}
      <section className="container">
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            minHeight: '480px',
            display: 'flex',
            alignItems: 'center',
            padding: '64px',
            backgroundColor: '#111',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80')`,
              backgroundPosition: 'center 40%',
              backgroundSize: 'cover',
              filter: 'brightness(0.38)',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '560px',
            }}
          >
            <span className="editorial-tag" style={{ marginBottom: '16px' }}>
              The Tailoring Salon
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                marginBottom: '16px',
                lineHeight: 1.15,
              }}
            >
              Architectural Fluidity & Precision Cuts
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '1rem',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}
            >
              Tailored wools, double-pleated volumes, and pure mulberry silks engineered for discerning presence in any setting.
            </p>
            <Link to="/shop?category=trousers-and-jeans">
              <Button variant="primary">Explore Tailoring</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. GENDER CATEGORIES SHOWCASE */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="editorial-tag" style={{ marginBottom: '12px' }}>
            Four Perspectives
          </span>
          <h2 style={{ fontSize: '2.4rem' }}>Curated Portfolios</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {[
            {
              title: 'Men',
              desc: 'Structured tailoring, oversized tees & heavy denim',
              img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
              link: '/shop?gender=men',
            },
            {
              title: 'Women',
              desc: 'Bias-cut silks, sculptural sets & active studio',
              img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
              link: '/shop?gender=women',
            },
            {
              title: 'Unisex',
              desc: 'Voluminous outerwear & minimalist heavy fleece',
              img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
              link: '/shop?gender=unisex',
            },
            {
              title: 'Junior',
              desc: 'Refined silhouettes for young contemporary icons',
              img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
              link: '/shop?gender=kids',
            },
          ].map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              style={{
                position: 'relative',
                display: 'block',
                height: '420px',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <img
                src={cat.img}
                alt={cat.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.65)',
                  transition: 'transform 0.5s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '28px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '0.1em',
                    marginBottom: '6px',
                  }}
                >
                  {cat.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. FEATURED COLLECTION */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span className="editorial-tag" style={{ marginBottom: '12px' }}>
              The Archive
            </span>
            <h2 style={{ fontSize: '2.4rem' }}>Featured Creations</h2>
          </div>
          <Link
            to="/shop?featured=true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-gold)',
              fontSize: '0.88rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Explore All <ArrowRight size={16} />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>
    </div>
  );
};
