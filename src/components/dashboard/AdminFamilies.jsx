import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function AdminFamilies({ session, onNotice }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchFamily, setSearchFamily] = useState('');
  const [confirmPopup, setConfirmPopup] = useState(null); // { family }

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setFamilies(data || []);
    } catch (err) {
      console.error('Error fetching families:', err);
      onNotice('حدث خطأ أثناء تحميل الأسر', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    // Prevent admin from removing or rejecting themselves
    if (session?.user?.id === id && status === 'rejected') {
      return onNotice('لا يمكنك رفض أو حذف حسابك الشخصي كمدير للمنصة!', 'error');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      setFamilies(families.map(f => f.id === id ? { ...f, status } : f));
      onNotice(`تم ${status === 'approved' ? 'قبول' : 'رفض'} الأسرة بنجاح`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      onNotice('حدث خطأ أثناء التحديث', 'error');
    }
  };

  const confirmDeleteFamily = async () => {
    if (!confirmPopup) return;
    const family = confirmPopup;

    try {
      // 1. Delete all products for this family first
      await supabase.from('products').delete().eq('owner_id', family.id);
      
      // 2. Delete the family profile
      const { error } = await supabase.from('profiles').delete().eq('id', family.id);

      if (error) throw error;

      setFamilies(families.filter(f => f.id !== family.id));
      onNotice(`تم حذف أسرة "${family.family_name}" وجميع منتجاتها نهائياً`, 'success');
    } catch (err) {
      console.error('Error deleting family:', err);
      onNotice('حدث خطأ أثناء الحذف. تأكد من إعدادات قاعدة البيانات (RLS).', 'error');
    } finally {
      setConfirmPopup(null);
    }
  };

  const filteredFamilies = families.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (searchFamily) {
      const search = searchFamily.toLowerCase();
      const matchName = f.family_name?.toLowerCase().includes(search);
      const matchCity = f.city?.toLowerCase().includes(search);
      const matchPhone = f.whatsapp?.includes(search);
      if (!matchName && !matchCity && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div>
      {/* ── Custom Confirmation Popup ── */}
      {confirmPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: '#1c1917', border: '1px solid #44403c',
            borderRadius: '18px', padding: '32px 28px', maxWidth: '420px', width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            {/* Warning Icon */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(185, 28, 28, 0.15)', border: '2px solid #b91c1c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px auto'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>

            <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', fontFamily: 'Cairo' }}>
              تأكيد الحذف النهائي
            </h3>
            <p style={{ color: '#a8a29e', fontSize: '14px', lineHeight: '1.7', margin: '0 0 8px 0' }}>
              هل أنت متأكد من حذف أسرة
            </p>
            <p style={{ color: '#fbbf24', fontSize: '17px', fontWeight: '800', margin: '0 0 10px 0', fontFamily: 'Cairo' }}>
              "{confirmPopup.family_name}"
            </p>
            <p style={{ color: '#ef4444', fontSize: '13px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '600' }}>
              سيتم حذف الأسرة وجميع منتجاتها نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmPopup(null)}
                style={{
                  padding: '10px 28px', borderRadius: '10px', border: '1px solid #44403c',
                  background: '#292524', color: '#d6d3d1', fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Cairo', transition: 'all 0.2s ease'
                }}
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteFamily}
                style={{
                  padding: '10px 28px', borderRadius: '10px', border: 'none',
                  background: '#b91c1c', color: '#ffffff', fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Cairo', transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(185, 28, 28, 0.4)'
                }}
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-tabs">
        <button className={`dash-tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>الكل</button>
        <button className={`dash-tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>قيد المراجعة</button>
        <button className={`dash-tab-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>مقبول</button>
        <button className={`dash-tab-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>مرفوض</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 ابحث باسم الأسرة، المدينة، أو رقم الواتساب..." 
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
                <th>اسم الأسرة</th>
                <th>المدينة</th>
                <th>النوع</th>
                <th>واتساب</th>
                <th>الحالة</th>
                <th>تاريخ التسجيل</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilies.map(family => {
                const isSelf = session?.user?.id === family.id;

                return (
                  <tr key={family.id} style={isSelf ? { background: 'rgba(251, 191, 36, 0.05)' } : {}}>
                    <td data-label="اسم الأسرة" style={{ fontWeight: 'bold' }}>
                      {family.family_name} {family.is_admin && <span style={{ fontSize: '11px', color: '#fbbf24', marginRight: '6px' }}>(مدير)</span>}
                    </td>
                    <td data-label="المدينة">{family.city}</td>
                    <td data-label="النوع">{family.category || 'غير محدد'}</td>
                    <td data-label="واتساب" dir="ltr" style={{ textAlign: 'right' }}>{family.whatsapp}</td>
                    <td data-label="الحالة">
                      <span className={`dash-badge dash-badge-${family.status}`}>
                        {family.status === 'approved' ? 'مقبول' : family.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                      </span>
                    </td>
                    <td data-label="تاريخ التسجيل">{new Date(family.created_at).toLocaleDateString('ar-EG')}</td>
                    <td data-label="إجراءات">
                      {isSelf ? (
                        <span className="dash-badge dash-badge-admin" style={{ opacity: 0.9 }}>حسابك الحالي <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "4px"}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {family.status !== 'approved' && (
                            <button 
                              className="dash-btn dash-btn-success dash-btn-sm"
                              onClick={() => updateStatus(family.id, 'approved')}
                            >
                              قبول
                            </button>
                          )}
                          {family.status !== 'rejected' && (
                            <button 
                              className="dash-btn dash-btn-danger dash-btn-sm"
                              onClick={() => updateStatus(family.id, 'rejected')}
                            >
                              رفض
                            </button>
                          )}
                          <button 
                            className="dash-btn dash-btn-sm"
                            onClick={() => setConfirmPopup(family)}
                            style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #991b1b' }}
                          >
                            حذف نهائي
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredFamilies.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>لا توجد أسر تطابق الفلتر الحالي</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
