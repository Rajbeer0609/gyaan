import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ProductGallery } from '../../components/product/ProductGallery';
import { ProductGrid } from '../../components/product/ProductGrid';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Heart, Check, Star, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useUI();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductBySlug(slug);
        if (res.data?.product) {
          const prod = res.data.product;
          setProduct(prod);
          setSelectedColor(prod.colors?.[0]?.name || prod.variants?.[0]?.color || 'Standard');
          setSelectedSize(prod.sizes?.[0] || prod.variants?.[0]?.size || 'M');
          setQuantity(1);

          // Fetch related products & reviews in parallel
          const [relRes, revRes] = await Promise.all([
            productService.getRelatedProducts(prod._id),
            reviewService.getProductReviews(prod._id),
          ]);
          if (relRes.data?.products) setRelatedProducts(relRes.data.products);
          if (revRes.data?.reviews) setReviews(revRes.data.reviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) {
    return (
      <div className="container" style={{ padding: '96px 24px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0 32px' }}>
          The garment you are looking for has been archived or does not exist.
        </p>
        <Link to="/shop">
          <Button variant="primary">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  // Variant matching
  const currentVariant = product.variants?.find(
    (v) =>
      v.color.toLowerCase() === selectedColor.toLowerCase() &&
      v.size.toLowerCase() === selectedSize.toLowerCase()
  );

  const stockAvailable = currentVariant ? currentVariant.stock : product.totalStock;
  const isOutOfStock = stockAvailable <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showToast('Selected variant is out of stock.', 'error');
      return;
    }
    try {
      await addToCart(product, selectedColor, selectedSize, quantity);
      showToast(`Added ${quantity}x ${product.name} to your bag.`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      showToast('Selected variant is out of stock.', 'error');
      return;
    }
    try {
      await addToCart(product, selectedColor, selectedSize, quantity);
      navigate('/checkout');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a review.', 'error');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewService.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      showToast('Review submitted successfully.');
      setReviews([res.data.review, ...reviews]);
      setReviewComment('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '96px' }}>
      {/* Breadcrumb Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '32px',
        }}
      >
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/shop?gender=${product.gender}`}>{product.gender}</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name}</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>{product.name}</span>
      </nav>

      {/* Main Product Info Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.1fr) minmax(300px, 0.9fr)',
          gap: '64px',
          alignItems: 'start',
          marginBottom: '80px',
        }}
        className="product-main-grid"
      >
        {/* Left: Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Purchasing & Configuration Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="editorial-tag">{product.brand || 'GYAAN'}</span>
              {product.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)', fontSize: '0.85rem' }}>
                  <Star size={14} fill="var(--color-gold)" />
                  <span style={{ fontWeight: 600 }}>{product.rating}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>({product.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', margin: '8px 0 16px', lineHeight: 1.15 }}>
              {product.name}
            </h1>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice > product.price && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-error)', fontWeight: 600 }}>
                    Save {product.discountPercentage}%
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Inclusive of all taxes. Free express shipping on orders above ₹2,500.
            </p>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.94rem', lineHeight: 1.7 }}>
            {product.shortDescription}
          </p>

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Color Shade: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedColor}</strong>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: selectedColor === c.name ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                      outline: selectedColor === c.name ? '3px solid rgba(201, 169, 110, 0.35)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>
                <span>Size: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedSize}</strong></span>
                <span style={{ color: 'var(--color-text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>Size Guide</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      minWidth: '50px',
                      padding: '10px 18px',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: selectedSize === sz ? 'var(--color-gold)' : 'var(--color-bg-surface)',
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

          {/* Quantity & Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)' }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: 36, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
              >
                -
              </button>
              <span style={{ width: 44, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                disabled={quantity >= stockAvailable}
                style={{ width: 36, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
              >
                +
              </button>
            </div>

            <div style={{ fontSize: '0.85rem' }}>
              {isOutOfStock ? (
                <span style={{ color: 'var(--color-error)' }}>Out of Stock</span>
              ) : stockAvailable <= 5 ? (
                <span style={{ color: 'var(--color-warning)' }}>Only {stockAvailable} left in stock</span>
              ) : (
                <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Ready for Dispatch
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toggleWishlist(product)}
                style={{ padding: '0 20px' }}
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={inWishlist ? 'var(--color-gold)' : 'none'} color={inWishlist ? 'var(--color-gold)' : 'currentColor'} />
              </Button>
            </div>

            <Button
              variant="secondary"
              fullWidth
              size="lg"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
            >
              Instant Checkout
            </Button>
          </div>

          {/* Reassurance Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={16} color="var(--color-gold)" /> Delivery in 2-4 business days
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} color="var(--color-gold)" /> Complimentary 7-day exchanges
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--color-gold)" /> Authenticated luxury quality
            </div>
          </div>
        </div>
      </div>

      {/* TABS: Description, Fabric Specs, Shipping, Reviews */}
      <section style={{ marginBottom: '80px' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            gap: '32px',
            marginBottom: '32px',
            overflowX: 'auto',
          }}
        >
          {['description', 'fabric & care', 'shipping & returns', 'client reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 0',
                fontSize: '0.88rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--color-gold)' : '2px solid transparent',
                fontWeight: activeTab === tab ? 600 : 400,
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab} {tab === 'client reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ maxWidth: '800px', lineHeight: 1.8, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          {activeTab === 'description' && (
            <div>
              <p style={{ marginBottom: '16px' }}>{product.description}</p>
              <h4 style={{ color: 'var(--color-text-primary)', margin: '24px 0 12px', fontSize: '1.1rem' }}>
                Key Sartorial Features
              </h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Engineered drop-shoulder cut with minimal structural distortion.</li>
                <li>Hand-finished inner seams for comfortable skin contact.</li>
                <li>Custom matte hardware and tonal embroidery insignia.</li>
              </ul>
            </div>
          )}

          {activeTab === 'fabric & care' && (
            <div>
              <p><strong>Primary Composition:</strong> {product.material}</p>
              <p><strong>Fabric Construction:</strong> {product.fabric}</p>
              <h4 style={{ color: 'var(--color-text-primary)', margin: '20px 0 10px', fontSize: '1.1rem' }}>
                Garment Care Instructions
              </h4>
              <p>
                Dry clean recommended for tailored wools and silks. For organic heavyweight cotton garments: machine wash cold inside out with like colors. Do not tumble dry. Warm iron on reverse if necessary.
              </p>
            </div>
          )}

          {activeTab === 'shipping & returns' && (
            <div>
              <p>
                Each GYAAN garment is packaged in custom recyclable luxury archival boxes. Domestic orders are dispatched via express insured courier with 48-hour tracking updates.
              </p>
              <p style={{ marginTop: '12px' }}>
                We provide a 7-day complimentary exchange window for unworn garments with original security tags intact.
              </p>
            </div>
          )}

          {activeTab === 'client reviews' && (
            <div>
              {/* Write Review Form */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  padding: '28px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                  marginBottom: '40px',
                }}
              >
                <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
                  Share Your Experience
                </h4>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Rating
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{ color: star <= reviewRating ? 'var(--color-gold)' : 'var(--color-border)', padding: 2 }}
                        >
                          <Star size={20} fill={star <= reviewRating ? 'var(--color-gold)' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Your Review
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Comment on the drape, silhouette, fabric density, and sizing..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" loading={submittingReview} style={{ alignSelf: 'flex-start' }}>
                    Post Review
                  </Button>
                </form>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        padding: '20px',
                        backgroundColor: 'var(--color-bg-surface)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>
                            {rev.user?.name || 'Verified Patron'}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: 'var(--color-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)', marginBottom: '8px' }}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="var(--color-gold)" />
                        ))}
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)' }}>
                  No customer reviews have been published for this piece yet.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <section>
          <div style={{ marginBottom: '32px' }}>
            <span className="editorial-tag" style={{ marginBottom: '8px' }}>
              Complementary Silhouettes
            </span>
            <h2 style={{ fontSize: '2rem' }}>You May Also Appreciate</h2>
          </div>
          <ProductGrid products={relatedProducts.slice(0, 4)} />
        </section>
      )}

      <style>{`
        @media (max-width: 900px) {
          .product-main-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};
