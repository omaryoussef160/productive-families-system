import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock next/image for JSDOM test environments
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { src, alt, fill, priority, sizes, style, ...rest } = props;
    const resolvedSrc = typeof src === 'object' && src !== null ? src.src : src;
    return React.createElement('img', {
      src: resolvedSrc,
      alt: alt || '',
      style,
      ...rest,
    });
  },
}));
