import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function MyProducts({ session, onNotice, onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [session]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      onNotice('حدث خطأ أثناء تحميل المنتجات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      onNotice('تم حذف المنتج بنجاح', 'success');
    } catch (err) {
      console.error('Error deleting product:', err);
      onNotice('حدث خطأ أثناء الحذف', 'error');
    }
  };

  if (loading) return <div>جاري تحميل منتجاتك...</div>;

  return (
    <div>
      {products.length === 0 ? (
        <div className="dash-stat-card" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍️</div>
          <h3 className="dash-heading">لا يوجد لديك منتجات حتى الآن</h3>
          <p style={{ color: 'var(--dash-text-muted)' }}>أضف منتجك الأول لتبدأ في البيع على المنصة</p>
        </div>
      ) : (
        <div className="dash-product-grid">
          {products.map(product => (
            <div key={product.id} className="dash-product-card">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="dash-product-image" />
              ) : (
                <div className="dash-product-image">🧺</div>
              )}
              
              <div className="dash-product-info">
                <h3 className="dash-product-name">{product.name}</h3>
                
                <div className="dash-product-meta">
                  <span className={`dash-badge dash-badge-${product.status}`}>
                    {product.status === 'approved' ? 'مقبول' : product.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                  </span>
                  <span className="dash-product-price">{product.price} ج.م</span>
                </div>
                
                <div className="dash-product-actions">
                  {product.status === 'rejected' && (
                    <button
                      className="dash-btn dash-btn-primary dash-btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => onEdit(product)}
                    >
                      ✏️ تعديل وإعادة للمراجعة
                    </button>
                  )}
                  <button 
                    className="dash-btn dash-btn-danger dash-btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleDelete(product.id)}
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
