import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import dashBanner from '../../assets/images/dash-banner.jpg';
import PageBanner from './PageBanner';

export default function DashboardOverview({ profile, session }) {
  const [stats, setStats] = useState({
    products: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    pendingProducts: 0,
    families: 0,
    pendingFamilies: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (profile?.is_admin) {
        // Admin stats
        const { data: allProducts } = await supabase.from('products').select('status');
        const pendingProductsCount = (allProducts || []).filter(p => p.status === 'pending').length;
        
        const { data: allProfiles } = await supabase.from('profiles').select('status, is_admin');
        const familiesList = (allProfiles || []).filter(p => !p.is_admin);
        const pendingFamiliesCount = familiesList.filter(p => p.status === 'pending').length;
        
        setStats({
          products: (allProducts || []).length,
          pendingProducts: pendingProductsCount,
          families: familiesList.length,
          pendingFamilies: pendingFamiliesCount
        });
      } else {
        // Family stats
        const { data: myProducts } = await supabase
          .from('products')
          .select('*')
          .eq('owner_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (myProducts) {
          setStats({
            products: myProducts.length,
            approvedProducts: myProducts.filter(p => p.status === 'approved').length,
            pendingProducts: myProducts.filter(p => p.status === 'pending').length,
            families: 0,
            pendingFamilies: 0
          });
          setRecentProducts(myProducts.slice(0, 5));
        }
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

      {/* Welcome Banner */}
      <PageBanner 
        title={<>أهلاً بك، {profile?.is_admin ? 'مدير المنصة' : profile?.family_name || 'صاحب النشاط'}! </>}
        description={profile?.is_admin ? "هنا مركز القيادة الخاص بك.. راقب أداء المنصة، راجع طلبات الانضمام، وأدر المنتجات لضمان الجودة." : "هنا مساحتك الخاصة.. تابعي أرقامك، راجعي منتجاتك، وأضيفي إبداعات جديدة لتصل لآلاف العملاء بسهولة."}
        imageSrc={dashBanner}
      />

      {/* Stats Row */}
      <div className="dash-stats-grid">
        {profile?.is_admin ? (
          <>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper blue-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">إجمالي الأسر المنتجة</div>
                <div className="dash-stat-value">{stats.families}</div>
              </div>
            </div>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper orange-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">أسر قيد المراجعة</div>
                <div className="dash-stat-value" style={{ color: 'var(--dash-warning)' }}>{stats.pendingFamilies}</div>
              </div>
            </div>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper purple-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">إجمالي المنتجات</div>
                <div className="dash-stat-value">{stats.products}</div>
              </div>
            </div>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper orange-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">منتجات قيد المراجعة</div>
                <div className="dash-stat-value" style={{ color: 'var(--dash-warning)' }}>{stats.pendingProducts}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper blue-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">إجمالي منتجاتك</div>
                <div className="dash-stat-value">{stats.products}</div>
              </div>
            </div>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper green-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">منتجاتك المقبولة</div>
                <div className="dash-stat-value" style={{ color: 'var(--dash-success)' }}>{stats.approvedProducts}</div>
              </div>
            </div>
            <div className="dash-stat-card premium-stat-card">
              <div className="stat-icon-wrapper orange-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div className="stat-content">
                <div className="dash-stat-title">قيد المراجعة</div>
                <div className="dash-stat-value" style={{ color: 'var(--dash-warning)' }}>{stats.pendingProducts}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Products (Only for non-admins) */}
      {!profile?.is_admin && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>أحدث منتجاتك</h3>
          </div>
          {recentProducts.length > 0 ? (
            <div className="dash-product-grid">
              {recentProducts.map(product => (
                <div key={product.id} className="dash-product-card">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="dash-product-image" />
                  ) : (
                    <div className="dash-product-image">📦</div>
                  )}
                  <div className="dash-product-info">
                    <h4 className="dash-product-name">{product.name}</h4>
                    <div className="dash-product-meta">
                      <span className={`dash-badge dash-badge-${product.status}`}>
                        {product.status === 'approved' ? 'مقبول' : product.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                      </span>
                      <span className="dash-product-price">{product.price} ج.م</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-stat-card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ marginBottom: "16px" }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: "var(--dash-primary)"}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
              <p style={{ color: 'var(--dash-text-muted)', margin: 0, fontSize: '14px' }}>لا توجد منتجات مضافة بعد</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
