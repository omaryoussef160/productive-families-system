import React from 'react';

export default function PageBanner({ title, description, imageSrc, size = 'large' }) {
  if (size === 'small') {
    return (
      <div className="dash-mini-banner">
        <div className="dash-mini-banner-text">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="dash-mini-banner-art">
          <img src={imageSrc} alt="Banner" />
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
      <div className="dash-banner-art">
        <img src={imageSrc} alt="Banner" />
      </div>
    </div>
  );
}
