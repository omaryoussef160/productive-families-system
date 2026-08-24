import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

export default function MyOrders({ session, onNotice }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price_at_time,
          orders (
            id,
            customer_name,
            customer_phone,
            status,
            created_at
          ),
          products (
            name,
            image_url
          )
        `)
        .eq('family_id', session.user.id)
        .order('id', { ascending: false, foreignTable: 'orders' });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (onNotice) onNotice('حدث خطأ أثناء جلب الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Optimistic update in UI
      setOrders(prev => prev.map(item => {
        if (item.orders && item.orders.id === orderId) {
          return { ...item, orders: { ...item.orders, status: newStatus } };
        }
        return item;
      }));

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      if (onNotice) onNotice('تم تحديث حالة الطلب بنجاح', 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      if (onNotice) onNotice('لا تملك صلاحية تعديل حالة هذا الطلب حالياً (يتطلب تحديث SQL)', 'error');
      fetchOrders(); // Revert on failure
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>جاري تحميل الطلبات...</div>;
  }

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">الطلبات الواردة</h3>
      </div>
      <div className="dash-card-body">
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#78716c' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <p>لا توجد طلبات واردة حتى الآن.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر الإجمالي</th>
                  <th>بيانات العميل</th>
                  <th>حالة الطلب</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => {
                  const order = item.orders;
                  const product = item.products;
                  if (!order || !product) return null;

                  const total = (item.quantity * item.price_at_time).toFixed(2);
                  const date = new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

                  const statusColors = {
                    pending: { bg: '#fef3c7', text: '#d97706' },
                    processing: { bg: '#e0f2fe', text: '#0369a1' },
                    completed: { bg: '#dcfce7', text: '#15803d' },
                    cancelled: { bg: '#fef2f2', text: '#b91c1c' }
                  };
                  const currentStyle = statusColors[order.status] || statusColors.pending;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={product.image_url || 'https://via.placeholder.com/40'} 
                            alt={product.name} 
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: '600' }}>{product.name}</span>
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 'bold', color: '#b91c1c' }}>{total} ج.م</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{order.customer_name}</span>
                          <span style={{ fontSize: '13px', color: '#57534e', direction: 'ltr', textAlign: 'right' }}>{order.customer_phone}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            background: currentStyle.bg,
                            color: currentStyle.text,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="completed">تم التوصيل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '14px', color: '#57534e' }}>{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
