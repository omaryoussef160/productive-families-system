import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function AdminProducts({ onNotice, onProductsUpdated }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div>
      <div className="dash-tabs">
        <button className={`dash-tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>الكل</button>
        <button className={`dash-tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>قيد المراجعة</button>
        <button className={`dash-tab-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>مقبول</button>
        <button className={`dash-tab-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>مرفوض</button>
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
                    ) : '🧺'}
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
