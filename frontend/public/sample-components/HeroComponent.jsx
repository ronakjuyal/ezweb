// Hero Component
// This component should be compiled and uploaded to S3
// Schema: { title, subtitle, ctaText, ctaLink, backgroundImage, backgroundColor }

import React from 'react';

export default function HeroComponent({
  title = 'Welcome to Our Website',
  subtitle = 'Build amazing experiences',
  ctaText = 'Get Started',
  ctaLink = '#',
  backgroundImage = '',
  backgroundColor = '#1e40af',
}) {
  const containerStyle = {
    minHeight: '500px',
    background: backgroundImage
      ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`
      : backgroundColor,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: '4rem 2rem',
  };

  const contentStyle = {
    maxWidth: '800px',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    lineHeight: '1.2',
  };

  const subtitleStyle = {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    opacity: 0.9,
  };

  const buttonStyle = {
    display: 'inline-block',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    color: backgroundColor,
    fontSize: '1.125rem',
    fontWeight: '600',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={subtitleStyle}>{subtitle}</p>
        <a
          href={ctaLink}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
