import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import PageBanner from './PageBanner';
import dashProductsImg from '../../dash-products.jpg';

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
    <div style={{ width: '100%' }}>
      <PageBanner 
        title="منتجاتي"
        description="استعرضي جميع منتجاتك الحالية، تابعي حالتها (مقبولة، قيد المراجعة، مرفوضة)، وقومي بتعديلها أو حذفها في أي وقت."
        imageSrc={dashProductsImg}
      />
      {products.length === 0 ? (
        <div className="dash-stat-card" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ marginBottom: "20px" }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: "var(--dash-primary)"}}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>
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
                <div className="dash-product-image" style={{display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f4", color: "#a8a29e"}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px"}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> تعديل وإعادة للمراجعة
                    </button>
                  )}
                  <button 
                    className="dash-btn dash-btn-danger dash-btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleDelete(product.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: "6px"}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> حذف
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
