import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function AdminProducts({ onNotice, onProductsUpdated }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchFamily, setSearchFamily] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(family_name)')
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

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      setProducts(products.map(p => p.id === id ? { ...p, status } : p));
      onProductsUpdated?.();
      onNotice(`تم ${status === 'approved' ? 'قبول' : 'رفض'} المنتج بنجاح`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      onNotice('حدث خطأ أثناء التحديث', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchProduct && !p.name.toLowerCase().includes(searchProduct.toLowerCase())) return false;
    const familyName = p.profiles?.family_name || 'غير معروف';
    if (searchFamily && !familyName.toLowerCase().includes(searchFamily.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="dash-tabs">
        <button className={`dash-tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>الكل</button>
        <button className={`dash-tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>قيد المراجعة</button>
        <button className={`dash-tab-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>مقبول</button>
        <button className={`dash-tab-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>مرفوض</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 ابحث باسم المنتج..." 
          className="dash-input" 
          value={searchProduct}
          onChange={(e) => setSearchProduct(e.target.value)}
          style={{ flex: '1 1 250px', padding: '12px 16px' }}
        />
        <input 
          type="text" 
          placeholder="🔍 ابحث باسم الأسرة (صاحب النشاط)..." 
          className="dash-input" 
          value={searchFamily}
          onChange={(e) => setSearchFamily(e.target.value)}
          style={{ flex: '1 1 250px', padding: '12px 16px' }}
        />
      </div>

      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="dash-table-container">
          <table className="dash-table dash-mobile-cards">
            <thead>
              <tr>
                <th>صورة</th>
                <th>اسم المنتج</th>
                <th>الأسرة</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td data-label="الصورة">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>)}
                  </td>
                  <td data-label="اسم المنتج" style={{ fontWeight: 'bold' }}>{product.name}</td>
                  <td data-label="الأسرة">{product.profiles?.family_name || 'غير معروف'}</td>
                  <td data-label="السعر">{product.price} ج.م</td>
                  <td data-label="الحالة">
                    <span className={`dash-badge dash-badge-${product.status}`}>
                      {product.status === 'approved' ? 'مقبول' : product.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                    </span>
                  </td>
                  <td data-label="إجراءات">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {product.status !== 'approved' && (
                        <button 
                          className="dash-btn dash-btn-success dash-btn-sm"
                          onClick={() => updateStatus(product.id, 'approved')}
                        >
                          قبول
                        </button>
                      )}
                      {product.status !== 'rejected' && (
                        <button 
                          className="dash-btn dash-btn-danger dash-btn-sm"
                          onClick={() => updateStatus(product.id, 'rejected')}
                        >
                          رفض
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>لا توجد منتجات تطابق الفلتر الحالي</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
