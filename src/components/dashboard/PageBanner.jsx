import React from 'react';
import Image from 'next/image';

export default function PageBanner({ title, description, imageSrc, size = 'large' }) {
  if (size === 'small') {
    return (
      <div className="dash-mini-banner">
        <div className="dash-mini-banner-text">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="dash-mini-banner-art" style={{ position: 'relative' }}>
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={title || 'Banner'}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              style={{ objectFit: 'cover' }}
            />
          )}
          <div className="dash-mini-fade"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-welcome-banner">
      <div className="dash-banner-text">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="dash-banner-art" style={{ position: 'relative' }}>
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={title || 'Banner'}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>
    </div>
  );
}
