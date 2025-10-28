import React, { useState, useEffect } from 'react';

export default function ProductContainerComponent({
  title = 'Our Products',
  subtitle = 'Discover our amazing collection',
  layout = 'grid', // 'grid' or 'masonry'
  columns = 3, // 2, 3, or 4
  cardStyle = 'elevated', // 'elevated', 'bordered', 'minimal'
  showQuickView = true,
  showAddToCart = true,
  backgroundColor = '#f8fafc',
  titleColor = '#1e293b',
  cardBgColor = '#ffffff',
  accentColor = '#3b82f6',
  hoverEffect = 'lift', // 'lift', 'zoom', 'shadow'
  animationDelay = 100, // milliseconds between each card animation
  categoryFilter = 'all', // 'all' or specific category ID
  sortBy = 'newest' // 'newest', 'price-low', 'price-high', 'name'
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [animatedCards, setAnimatedCards] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, sortBy]);

  useEffect(() => {
    // Stagger animation for cards
    if (products.length > 0) {
      products.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedCards(prev => [...prev, index]);
        }, index * animationDelay);
      });
    }
  }, [products, animationDelay]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Get website ID from URL subdomain
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      const response = await fetch(`/api/websites/subdomain/${subdomain}/products/available`);
      let data = await response.json();

      // Apply filtering
      if (categoryFilter !== 'all') {
        data = data.filter(p => p.categoryId === parseInt(categoryFilter));
      }

      // Apply sorting
      data = sortProducts(data, sortBy);

      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortType) => {
    const sorted = [...products];
    switch (sortType) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const getGridColumns = () => {
    const colMap = {
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-2 lg:grid-cols-3',
      4: 'sm:grid-cols-2 lg:grid-cols-4'
    };
    return colMap[columns] || colMap[3];
  };

  const getHoverEffectClass = () => {
    const effects = {
      lift: 'hover:-translate-y-2 hover:shadow-xl',
      zoom: 'hover:scale-105',
      shadow: 'hover:shadow-2xl'
    };
    return effects[hoverEffect] || effects.lift;
  };

  const getCardStyleClass = () => {
    const styles = {
      elevated: 'shadow-md',
      bordered: 'border-2 border-gray-200',
      minimal: 'border border-gray-100'
    };
    return styles[cardStyle] || styles.elevated;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor,
        padding: '4rem 1rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 0'
          }}>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '9999px',
              height: '4rem',
              width: '4rem',
              borderTopWidth: '4px',
              borderBottomWidth: '4px',
              borderColor: accentColor,
              borderStyle: 'solid',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor,
      padding: '4rem 1rem'
    }}>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px ${accentColor}33;
          }
          50% {
            box-shadow: 0 0 40px ${accentColor}66;
          }
        }

        .product-card {
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .image-container {
          position: relative;
          overflow: hidden;
        }

        .image-container img {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .image-container:hover img {
          transform: scale(1.1);
        }

        .quick-view-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 1rem;
        }

        .image-container:hover .quick-view-overlay {
          opacity: 1;
        }

        .price-badge {
          background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%);
          animation: pulse-glow 2s infinite;
        }

        .add-to-cart-btn {
          background: ${accentColor};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .add-to-cart-btn:hover {
          background: ${accentColor}dd;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px ${accentColor}44;
        }

        .product-badge {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          animation: shimmer 2s infinite;
          background-size: 200% 100%;
        }
      `}</style>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h2
            style={{
              color: titleColor,
              fontSize: 'clamp(2.25rem, 5vw, 3rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              letterSpacing: '-0.025em'
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{
              fontSize: '1.25rem',
              color: '#4b5563',
              maxWidth: '42rem',
              margin: '0 auto'
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 0'
          }}>
            <div style={{
              fontSize: '3.75rem',
              marginBottom: '1rem'
            }}>🛍️</div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>No products available</h3>
            <p style={{
              color: '#6b7280'
            }}>Check back soon for new items!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${columns === 2 ? '350px' : columns === 4 ? '250px' : '300px'}, 1fr))`,
            gap: '2rem',
            width: '100%'
          }}>
            {products.map((product, index) => {
              const imageUrl = product.imageUrls && product.imageUrls.length > 0
                ? product.imageUrls[0]
                : product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image';

              return (
                <div
                  key={product.id}
                  className={`product-card ${getCardStyleClass()} ${getHoverEffectClass()} rounded-xl overflow-hidden transition-all duration-300`}
                  style={{
                    backgroundColor: cardBgColor,
                    opacity: animatedCards.includes(index) ? 1 : 0,
                    animationDelay: `${index * 0.1}s`,
                    maxWidth: '100%',
                    width: '100%',
                    height: 'fit-content'
                  }}
                >
                  {/* Image Container */}
                  <div className="image-container relative" style={{
                    aspectRatio: '1 / 1',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />

                    {/* Stock Badge */}
                    {product.stock < 5 && product.stock > 0 && (
                      <div className="absolute top-4 right-4 product-badge text-white text-xs font-bold px-3 py-1 rounded-full">
                        Only {product.stock} left!
                      </div>
                    )}

                    {/* Out of Stock Badge */}
                    {product.stock === 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}

                    {/* Quick View Overlay */}
                    {showQuickView && (
                      <div className="quick-view-overlay">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-white text-sm font-semibold px-6 py-2 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-all"
                        >
                          Quick View
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="price-badge text-white font-bold text-2xl px-4 py-2 rounded-lg">
                        ${parseFloat(product.price).toFixed(2)}
                      </div>

                      {product.stock > 0 && (
                        <div className="text-sm text-gray-500">
                          {product.stock} in stock
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    {showAddToCart && product.stock > 0 && (
                      <button
                        className="add-to-cart-btn w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                        onClick={() => {
                          // Add to cart logic here
                          alert(`Added ${product.name} to cart!`);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden">
                  <img
                    src={selectedProduct.imageUrls?.[0] || selectedProduct.imageUrl || 'https://via.placeholder.com/400'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.imageUrls.slice(1, 5).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedProduct.name} ${idx + 2}`}
                        className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedProduct.name}
                </h2>

                <div className="text-4xl font-bold mb-6" style={{ color: accentColor }}>
                  ${parseFloat(selectedProduct.price).toFixed(2)}
                </div>

                {selectedProduct.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                )}

                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-semibold ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  {selectedProduct.sku && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-mono text-sm">{selectedProduct.sku}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-3">
                  {selectedProduct.stock > 0 && (
                    <button
                      className="add-to-cart-btn w-full text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 text-lg"
                      onClick={() => {
                        alert(`Added ${selectedProduct.name} to cart!`);
                        setSelectedProduct(null);
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                  )}
                  <button
                    className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
