import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import DashboardOverview from './dashboard/DashboardOverview';
import MyProducts from './dashboard/MyProducts';
import AddProduct from './dashboard/AddProduct';
import ProfileSettings from './dashboard/ProfileSettings';
import AdminFamilies from './dashboard/AdminFamilies';
import AdminProducts from './dashboard/AdminProducts';
import '../dashboard.css';
import '../dashboard-responsive.css';
import '../product-review.css';

/* Clean SVG Icons */
const icons = {
  overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  products: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  add: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  families: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  adminProducts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export function Dashboard({ session, onBack, onRefreshProducts, onNotice }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      onNotice('حدث خطأ في تحميل بيانات الملف الشخصي', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const familyItems = [
    { id: 'overview', label: 'نظرة عامة', icon: icons.overview },
    { id: 'products', label: 'منتجاتي', icon: icons.products },
    { id: 'add', label: 'إضافة منتج', icon: icons.add },
    { id: 'profile', label: 'ملفي الشخصي', icon: icons.profile },
  ];

  const adminItems = [
    { id: 'overview', label: 'نظرة عامة', icon: icons.overview },
    { id: 'admin-families', label: 'إدارة الأسر', icon: icons.families },
    { id: 'admin-products', label: 'إدارة المنتجات', icon: icons.adminProducts },
  ];

  const navItems = profile?.is_admin ? adminItems : familyItems;

  if (loading) {
    return (
      <div className="dash-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: 'var(--dash-accent)' }}>جاري التحميل...</div>
      </div>
    );
  }

  // Block pending family users until Admin approves them
  if (!profile?.is_admin && profile?.status === 'pending') {
    return (
      <div className="dash-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', minHeight: '100vh', width: '100vw' }}>
        <div style={{ background: 'var(--dash-bg-card)', border: '1px solid var(--dash-border)', padding: '40px 32px', borderRadius: '16px', maxWidth: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ color: '#fbbf24', fontFamily: 'Cairo', margin: '0 0 12px 0', fontSize: '22px' }}>حسابك قيد المراجعة</h2>
          <p style={{ color: 'var(--dash-text-muted)', lineHeight: '1.7', margin: '0 0 24px 0', fontSize: '14px' }}>
            أهلاً بك 👋 طلبك قيد المراجعة حالياً من قِبل إدارة المنصة. سيتم التواصل معك على رقم الواتساب فور قبول حسابك وتفعيله.
          </p>
          <div className="dash-pending-actions">
            <button className="dash-btn dash-btn-primary" onClick={onBack}>العودة للمتجر الرئيسي</button>
            <button className="dash-btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#e7e5e4' }} onClick={handleLogout}>تسجيل الخروج</button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview profile={profile} session={session} />;
      case 'products':
        return <MyProducts session={session} onNotice={onNotice} onEdit={(product) => { setEditingProduct(product); setActiveTab('add'); }} />;
      case 'add':
        return <AddProduct session={session} onNotice={onNotice} onNavigate={setActiveTab} productToEdit={editingProduct} onEditComplete={() => setEditingProduct(null)} />;
      case 'profile':
        return <ProfileSettings profile={profile} session={session} onNotice={onNotice} onProfileUpdate={fetchProfile} />;
      case 'admin-families':
        return profile?.is_admin ? <AdminFamilies session={session} onNotice={onNotice} /> : null;
      case 'admin-products':
        return profile?.is_admin ? <AdminProducts onNotice={onNotice} onProductsUpdated={onRefreshProducts} /> : null;
      default:
        return <DashboardOverview profile={profile} session={session} />;
    }
  };

  const getPageTitle = () => {
    const activeItem = navItems.find(item => item.id === activeTab);
    return editingProduct && activeTab === 'add' ? 'تعديل المنتج' : activeItem ? activeItem.label : 'لوحة التحكم';
  };

  return (
    <div className="dash-container">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="dash-backdrop" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`dash-sidebar ${mobileMenuOpen ? 'show' : ''}`}>
        <div className="dash-logo-area">
          <div className="dash-brand">
            <div className="dash-brand-icon">L</div>
            <h2 className="dash-logo-text">لمسة أسرة</h2>
          </div>
          <button className="dash-mobile-toggle" onClick={() => setMobileMenuOpen(false)}>
            ✕
          </button>
        </div>

        {/* User Card */}
        <div className="dash-user-card">
          <div className="dash-user-avatar">
            {(profile?.family_name || 'أ').charAt(0)}
          </div>
          <div className="dash-user-details">
            <span className="dash-user-name">{profile?.family_name || 'أسرة منتجة'}</span>
            <span className="dash-user-role">
              {profile?.is_admin ? 'مدير المنصة' : 'أسرة منتجة'}
            </span>
          </div>
        </div>

        <nav className="dash-nav">
          <div className="dash-nav-title">{profile?.is_admin ? 'الإدارة' : 'القائمة'}</div>
          {navItems.map(item => (
            <button 
              key={item.id}
              type="button"
              className={`dash-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setEditingProduct(null); setActiveTab(item.id); setMobileMenuOpen(false); }}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span className="dash-nav-label">{item.label}</span>
            </button>
          ))}

          <div className="dash-nav-bottom">
            <button type="button" className="dash-nav-btn" onClick={onBack}>
              <span className="dash-nav-icon">{icons.home}</span>
              <span className="dash-nav-label">العودة للمتجر</span>
            </button>
            <button type="button" className="dash-nav-btn dash-nav-logout" onClick={handleLogout}>
              <span className="dash-nav-icon">{icons.logout}</span>
              <span className="dash-nav-label">تسجيل الخروج</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <header className="dash-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="dash-mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="dash-header-title">{getPageTitle()}</h1>
          </div>
        </header>
        
        <div className="dash-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
