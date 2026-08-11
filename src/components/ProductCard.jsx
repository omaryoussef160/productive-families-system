import { whatsappOrderLink } from '../lib/whatsapp';

export function ProductCard({ product }) {
  const family = product.profiles || {};

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

        <div className="price" style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f5f5f4' }}>
          <b style={{ color: '#b91c1c', fontSize: '17px', fontWeight: '800' }}>{product.price} ج.م</b>
          <a 
            href={whatsappOrderLink(product)} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              background: '#0f766e', 
              color: '#ffffff', 
              padding: '7px 14px', 
              borderRadius: '8px', 
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            <span>طلب واتساب</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
