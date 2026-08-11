import { categories } from '../data/catalog';
import { ProductCard } from './ProductCard';

export function ProductsSection({ products, selectedCategory, onCategoryChange, selectedFamily, onClearFamilyFilter }) {
  let shown = products;

  if (selectedFamily) {
    shown = products.filter(p => p.owner_id === selectedFamily.id || p.profiles?.family_name === selectedFamily.family_name);
  } else if (selectedCategory !== 'الكل') {
    shown = products.filter(p => p.category === selectedCategory);
  }

  return (
    <section id="products" className="section source-section">
      <div className="section-title">
        <div>
          <h2 style={{ color: '#1c1917', fontWeight: '800' }}>تصفّحي المنتجات حسب القسم</h2>
          <p style={{ color: '#57534e', fontSize: '15px' }}>استكشفي أحدث إبداعات الأسر المنتجة المسجلة بالمنصة.</p>
        </div>
      </div>

      {/* Selected Family Active Banner */}
      {selectedFamily && (
        <div style={{
          background: 'linear-gradient(135deg, #292524 0%, #1c1917 100%)',
          border: '1px solid #fbbf24',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '15px' }}>
              عرض منتجات الأسرة: <strong style={{ color: '#fbbf24' }}>{selectedFamily.family_name || 'الأسرة'}</strong> ({shown.length} منتجات)
            </span>
          </div>
          <button
            onClick={onClearFamilyFilter}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            عرض جميع المنتجات ✕
          </button>
        </div>
      )}

      {/* Categories Chips */}
      {!selectedFamily && (
        <div className="chips">
          {['الكل', ...categories].map(c => (
            <button
              key={c}
              className={selectedCategory === c ? 'active' : ''}
              onClick={() => onCategoryChange(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid">
        {shown.map(product => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="empty" style={{ color: '#57534e', fontSize: '15px', fontWeight: '600', padding: '40px 0' }}>
          {selectedFamily
            ? `لا توجد منتجات معروضة حالياً لهذه الأسرة (${selectedFamily.family_name}).`
            : 'لا توجد منتجات مضافة ومقبولة في هذا القسم حالياً.'}
        </p>
      )}
    </section>
  );
}
