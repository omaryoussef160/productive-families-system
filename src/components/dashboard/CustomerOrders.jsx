import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

export default function CustomerOrders({ session, onNotice }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            quantity,
            price_at_time,
            products (name, image_url),
            profiles (family_name)
          )
        `)
        .eq('customer_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      if (onNotice) onNotice('حدث خطأ أثناء جلب طلباتك', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>جاري تحميل طلباتك...</div>;
  }

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#d97706', label: 'قيد الانتظار' },
    processing: { bg: '#e0f2fe', text: '#0369a1', label: 'جاري التجهيز' },
    completed: { bg: '#dcfce7', text: '#15803d', label: 'تم التوصيل' },
    cancelled: { bg: '#fef2f2', text: '#b91c1c', label: 'ملغي' }
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">مشترياتي (طلباتي السابقة)</h3>
      </div>
      <div className="dash-card-body">
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#78716c' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <p>لم تقم بأي طلبات بعد.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => {
              const date = new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              const currentStyle = statusColors[order.status] || statusColors.pending;

              return (
                <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>تاريخ الطلب</div>
                      <div style={{ fontWeight: 'bold', color: '#374151' }}>{date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>الإجمالي</div>
                      <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>{order.total_amount} ج.م</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>حالة الطلب</div>
                      <div style={{
                        background: currentStyle.bg,
                        color: currentStyle.text,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}>
                        {currentStyle.label}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>عناصر الطلب:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(order.order_items || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img 
                            src={item.products?.image_url || 'https://via.placeholder.com/50'} 
                            alt={item.products?.name} 
                            style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{item.products?.name}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              الأسرة: {item.profiles?.family_name || 'غير محدد'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#4b5563', fontSize: '14px' }}>الكمية: {item.quantity}</div>
                            <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>{item.price_at_time} ج.م</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
