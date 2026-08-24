import { whatsappOrderLink } from '../lib/whatsapp';
import { useCartStore } from '../store/cartStore';

export function ProductCard({ product }) {
  const family = product.profiles || {};
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartStore((state) => state.openCart);

  return (
    <article className="product">
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        )}
      </div>

      <div className="product-body">
        <small style={{ color: '#0f766e', fontWeight: '700', fontSize: '12px' }}>{product.category}</small>
        <h3 style={{ color: '#1c1917', fontSize: '18px', fontWeight: '800', margin: '6px 0' }}>{product.name}</h3>

        {/* Product Description with high contrast text */}
        {product.description && (
          <p className="product-desc" style={{ 
            fontSize: '13.5px', 
            color: '#44403c', 
            margin: '6px 0 10px 0', 
            lineHeight: '1.5',
            fontWeight: '500',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.description}
          </p>
        )}

        {/* Family Name & Location with SVG Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#292524', fontWeight: '600', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{family.family_name || 'أسرة منتجة'} {family.city ? `— ${family.city}` : ''}</span>
        </div>

        <div className="price" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f5f5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ color: '#b91c1c', fontSize: '17px', fontWeight: '800' }}>{product.price} ج.م</b>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => {
                addToCart(product);
                openCart();
              }}
              style={{
                background: '#fbbf24',
                color: '#1c1917',
                border: 'none',
                padding: '7px 10px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="أضف إلى السلة"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
            <a 
              href={whatsappOrderLink(product)} 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#0f766e', 
                color: '#ffffff', 
                padding: '7px 10px', 
                borderRadius: '8px', 
                fontWeight: '700',
                textDecoration: 'none'
              }}
              title="استفسار واتساب"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
