import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function DashboardOverview({ profile, session }) {
  const [stats, setStats] = useState({
    products: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    families: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: myProducts } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (myProducts) {
        setStats(prev => ({
          ...prev,
          products: myProducts.length,
          approvedProducts: myProducts.filter(p => p.status === 'approved').length,
          pendingProducts: myProducts.filter(p => p.status === 'pending').length,
        }));
        setRecentProducts(myProducts.slice(0, 5));
      }

      if (profile?.is_admin) {
        const { data: allProfiles } = await supabase.from('profiles').select('id, is_admin');
        const familiesCount = (allProfiles || []).filter(p => !p.is_admin).length;
        
        setStats(prev => ({
          ...prev,
          families: familiesCount || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Stats Row */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-title">إجمالي منتجاتك 📦</div>
          <div className="dash-stat-value">{stats.products}</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-title">منتجاتك المقبولة ✅</div>
          <div className="dash-stat-value" style={{ color: 'var(--dash-success)' }}>{stats.approvedProducts}</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-title">قيد المراجعة ⏳</div>
          <div className="dash-stat-value" style={{ color: 'var(--dash-warning)' }}>{stats.pendingProducts}</div>
        </div>
        {profile?.is_admin && (
          <div className="dash-stat-card">
            <div className="dash-stat-title">إجمالي الأسر المنتجة 👥</div>
            <div className="dash-stat-value">{stats.families}</div>
          </div>
        )}
      </div>

      {/* Recent Products */}
      <div style={{ marginTop: '20px' }}>
        <h3 className="dash-heading" style={{ fontSize: '17px', marginBottom: '12px' }}>أحدث منتجاتك المضافة</h3>
        {recentProducts.length > 0 ? (
          <div className="dash-table-container">
            <table className="dash-table dash-mobile-cards">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>السعر</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(product => (
                  <tr key={product.id}>
                    <td data-label="المنتج" style={{ fontWeight: 'bold' }}>{product.name}</td>
                    <td data-label="السعر" style={{ color: 'var(--dash-accent)' }}>{product.price} ج.م</td>
                    <td data-label="الحالة">
                      <span className={`dash-badge dash-badge-${product.status}`}>
                        {product.status === 'approved' ? 'مقبول' : product.status === 'pending' ? 'مراجعة' : 'مرفوض'}
                      </span>
                    </td>
                    <td data-label="التاريخ" style={{ color: 'var(--dash-text-muted)', fontSize: '13px' }}>
                      {new Date(product.created_at).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dash-stat-card" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <p style={{ color: 'var(--dash-text-muted)', margin: 0, fontSize: '14px' }}>لا توجد منتجات مضافة بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
