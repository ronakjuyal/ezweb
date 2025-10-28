// Product Grid Component
// This component fetches and displays products from the API
// Schema: { title, subtitle, backgroundColor, showPrice, columns }

import React, { useState, useEffect } from 'react';

export default function ProductGridComponent({
  title = 'Our Products',
  subtitle = 'Discover our amazing collection',
  backgroundColor = '#f3f4f6',
  showPrice = true,
  columns = 3,
  websiteId = null,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (websiteId) {
      fetchProducts();
    }
  }, [websiteId]);

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${apiUrl}/websites/${websiteId}/products/available`);

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    backgroundColor: backgroundColor,
    padding: '4rem 2rem',
  };

  const headerStyle = {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 3rem',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#1f2937',
  };

  const subtitleStyle = {
    fontSize: '1.25rem',
    color: '#6b7280',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const productCardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
  };

  const imageContainerStyle = {
    width: '100%',
    height: '250px',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const contentStyle = {
    padding: '1.5rem',
  };

  const productTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937',
  };

  const descriptionStyle = {
    color: '#6b7280',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  };

  const priceStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#059669',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>No products available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={subtitleStyle}>{subtitle}</p>
      </div>

      <div style={gridStyle}>
        {products.map((product) => (
          <div
            key={product.id}
            style={productCardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={imageContainerStyle}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={imageStyle} />
              ) : (
                <div
                  style={{
                    ...imageStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                  }}
                >
                  📦
                </div>
              )}
            </div>

            <div style={contentStyle}>
              <h3 style={productTitleStyle}>{product.name}</h3>
              {product.description && <p style={descriptionStyle}>{product.description}</p>}
              {showPrice && <p style={priceStyle}>${product.price.toFixed(2)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
