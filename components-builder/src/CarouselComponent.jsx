import React, { useState, useEffect, useCallback } from 'react';

export default function CarouselComponent({
  carouselImages = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  transitionEffect = 'slide', // 'slide', 'fade', 'zoom', 'cube'
  showDots = true,
  showArrows = true,
  showThumbnails = false,
  height = 'medium', // 'small', 'medium', 'large', 'fullscreen'
  captionPosition = 'bottom-left', // 'bottom-left', 'bottom-center', 'center', 'top-right'
  overlayOpacity = 0.3,
  borderRadius = 'lg', // 'none', 'sm', 'md', 'lg', 'xl', 'full'
  arrowStyle = 'circle', // 'circle', 'square', 'minimal'
  dotStyle = 'dot', // 'dot', 'line', 'square'
  enableSwipe = true,
  parallaxEffect = false,
  kenBurnsEffect = false,
  pauseOnHover = true,
  // Styling
  backgroundColor = '#000000',
  arrowColor = '#ffffff',
  dotColor = '#ffffff',
  activeDotColor = '#3b82f6'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState('next');

  const images = carouselImages.length > 0
    ? carouselImages
    : [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600'
      ];

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setDirection('next');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [images.length, isAnimating]);

  const goToPrevious = useCallback(() => {
    if (isAnimating) return;
    setDirection('prev');
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 700);
  }, [images.length, isAnimating]);

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setDirection(index > currentIndex ? 'next' : 'prev');
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || images.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, isPaused, images.length]);

  // Touch/Swipe handlers
  const handleTouchStart = (e) => {
    if (!enableSwipe) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!enableSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!enableSwipe) return;
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious();
    }
  };

  const getHeightStyle = () => {
    const heights = {
      small: '256px',
      medium: '384px',
      large: '600px',
      fullscreen: '100vh'
    };
    return heights[height] || heights.medium;
  };

  const getBorderRadiusStyle = () => {
    const radii = {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    };
    return radii[borderRadius] || radii.lg;
  };

  const getTransitionClass = () => {
    const transitions = {
      slide: direction === 'next'
        ? 'carousel-slide-next'
        : 'carousel-slide-prev',
      fade: 'carousel-fade',
      zoom: 'carousel-zoom',
      cube: 'carousel-cube'
    };
    return transitions[transitionEffect] || transitions.slide;
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      backgroundColor
    }}>
      <style>{`
        /* Slide Animation */
        @keyframes slideInNext {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOutNext {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }

        @keyframes slideInPrev {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOutPrev {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }

        /* Fade Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Zoom Animation */
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Ken Burns Effect */
        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.2) translate(-5%, -5%);
          }
        }

        /* Parallax Effect */
        @keyframes parallax {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-20px);
          }
        }

        .carousel-slide-next {
          animation: slideInNext 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carousel-slide-prev {
          animation: slideInPrev 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carousel-fade {
          animation: fadeIn 0.7s ease-in-out;
        }

        .carousel-zoom {
          animation: zoomIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carousel-image {
          transition: transform 0.3s ease;
        }

        .carousel-image.ken-burns {
          animation: kenBurns 20s ease-in-out infinite alternate;
        }

        .carousel-image.parallax:hover {
          animation: parallax 2s ease-in-out infinite alternate;
        }

        .carousel-arrow {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .carousel-arrow:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        .carousel-dot {
          transition: all 0.3s ease;
        }

        .carousel-dot:hover {
          transform: scale(1.2);
        }

        .carousel-thumbnail {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .carousel-thumbnail:hover {
          transform: scale(1.05);
          opacity: 1 !important;
        }

        .carousel-thumbnail.active {
          border-color: ${activeDotColor};
          opacity: 1 !important;
        }
      `}</style>

      <div
        className="relative"
        style={{
          height: getHeightStyle(),
          borderRadius: getBorderRadiusStyle(),
          overflow: 'hidden'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        {/* Images */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}>
          {images.map((image, index) => (
            <div
              key={index}
              className={index === currentIndex ? getTransitionClass() : ''}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: index === currentIndex ? 'block' : 'none'
              }}
            >
              {/* Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                  background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 0.5}) 0%, rgba(0,0,0,${overlayOpacity}) 100%)`
                }}
              />

              {/* Image */}
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className={`carousel-image ${kenBurnsEffect ? 'ken-burns' : ''} ${parallaxEffect ? 'parallax' : ''}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={isAnimating}
              className="carousel-arrow"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                borderRadius: arrowStyle === 'circle' ? '9999px' : arrowStyle === 'square' ? '0.5rem' : '0',
                backgroundColor: arrowStyle === 'minimal' ? 'transparent' : 'rgba(0,0,0,0.3)',
                padding: '0.75rem',
                color: arrowColor,
                border: 'none',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                opacity: isAnimating ? 0.5 : 1
              }}
            >
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              disabled={isAnimating}
              className="carousel-arrow"
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                borderRadius: arrowStyle === 'circle' ? '9999px' : arrowStyle === 'square' ? '0.5rem' : '0',
                backgroundColor: arrowStyle === 'minimal' ? 'transparent' : 'rgba(0,0,0,0.3)',
                padding: '0.75rem',
                color: arrowColor,
                border: 'none',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                opacity: isAnimating ? 0.5 : 1
              }}
            >
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {showDots && images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: '0.5rem'
          }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isAnimating}
                className="carousel-dot"
                style={{
                  width: dotStyle === 'line' ? '2rem' : '0.75rem',
                  height: dotStyle === 'line' ? '0.5rem' : '0.75rem',
                  borderRadius: dotStyle === 'dot' || dotStyle === 'line' ? '9999px' : '0.25rem',
                  backgroundColor: index === currentIndex ? activeDotColor : dotColor,
                  opacity: index === currentIndex ? 1 : 0.5,
                  border: 'none',
                  cursor: isAnimating ? 'not-allowed' : 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {autoPlay && !isPaused && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            height: '0.25rem',
            backgroundColor: 'rgba(255,255,255,0.2)'
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: activeDotColor,
                width: '0%',
                animation: `progressBar ${autoPlayInterval}ms linear`,
                transition: 'all 0.3s'
              }}
            />
          </div>
        )}

        {/* Slide Counter */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 20,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
              style={{
                flexShrink: 0,
                width: '5rem',
                height: '5rem',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: index === currentIndex ? activeDotColor : 'transparent',
                opacity: index === currentIndex ? 1 : 0.6,
                cursor: 'pointer',
                padding: 0
              }}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
