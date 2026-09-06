import '../assets/styles/styles.css';
import '../assets/styles/hero.css';
import '../assets/styles/hero-overrides.css';
import '../assets/styles/hero-exact.css';
import '../assets/styles/hero-fix.css';
import '../assets/styles/source-layout.css';
import '../assets/styles/header-mobile-overrides.css';
import '../assets/styles/header-desktop-overrides.css';
import '../assets/styles/source-sections.css';
import '../assets/styles/header-fix.css';
import '../assets/styles/hero-button-align.css';
import '../assets/styles/how-exact.css';
import '../assets/styles/product-image-fix.css';
import '../assets/styles/join-exact.css';
import '../assets/styles/join-form-enhanced.css';
import '../assets/styles/dashboard.css';
import '../assets/styles/dashboard-responsive.css';
import '../assets/styles/product-review.css';
import '../assets/styles/cart-drawer.css';

import { Providers } from './providers';

export const metadata = {
  title: 'لمسة أسرة - منصة الأسر المنتجة',
  description: 'منصة إلكترونية لربط الأسر المنتجة بالزبائن، لدعم المشاريع المنزلية والحرف اليدوية.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
