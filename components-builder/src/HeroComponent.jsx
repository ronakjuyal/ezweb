import React from 'react';

/**
 * Hero Section Component
 * A customizable hero section with title, subtitle, CTA button, background image/color
 */
export default function HeroComponent({
  title = 'Welcome to Our Website',
  subtitle = 'Build amazing websites without code',
  buttonText = 'Get Started',
  buttonLink = '#',
  backgroundColor = '#1e3a8a',
  textColor = '#ffffff',
  showButton = true,
  backgroundImage = '',
  imageUrl = '',
  imagePosition = 'right',
  showImage = false,
  imageAlt = 'Hero Image'
}) {

  const hasBackgroundImage = backgroundImage && backgroundImage.trim() !== '';

  return (
    <div
      style={{
        backgroundColor: hasBackgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: hasBackgroundImage ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: textColor,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          flexDirection: imagePosition === 'right' ? 'row' : 'row-reverse',
          alignItems: 'center',
          gap: '3rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Text Content */}
        <div style={{
          flex: showImage ? '1 1 400px' : '1 1 100%',
          textAlign: showImage ? 'left' : 'center',
          margin: showImage ? '0' : '0 auto'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            {title}
          </h1>

          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            {subtitle}
          </p>

          {showButton && (
            <a
              href={buttonLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#ffffff',
                color: backgroundColor,
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {buttonText}
            </a>
          )}
        </div>

        {/* Image Content */}
        {showImage && imageUrl && (
          <div style={{
            flex: '1 1 400px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img
              src={imageUrl}
              alt={imageAlt}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '1rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
