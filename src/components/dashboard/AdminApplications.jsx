import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function AdminApplications({ onNotice }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      onNotice('حدث خطأ أثناء تحميل الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appItem, status) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', appItem.id);
        
      if (error) throw error;

      // Sync profile status if matching whatsapp exists
      if (appItem.whatsapp) {
        await supabase
          .from('profiles')
          .update({ status })
          .eq('whatsapp', appItem.whatsapp);
      }
      
      setApplications(applications.map(a => a.id === appItem.id ? { ...a, status } : a));
      onNotice(`تم تحديث حالة الطلب إلى ${status === 'approved' ? 'مقبول' : 'مرفوض'} بنجاح`, 'success');
    } catch (err) {
      console.error('Error updating application status:', err);
      onNotice('حدث خطأ أثناء التحديث', 'error');
    }
  };

  const filteredApps = applications.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div>
      
      <div className="dash-tabs">
        <button className={`dash-tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>الكل</button>
        <button className={`dash-tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>الجديدة</button>
        <button className={`dash-tab-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>مقبولة</button>
        <button className={`dash-tab-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>مرفوضة</button>
      </div>

      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>اسم الأسرة</th>
                <th>المدينة</th>
                <th>النشاط</th>
                <th>واتساب</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 'bold' }}>{app.family_name}</td>
                  <td>{app.city}</td>
                  <td>{app.category}</td>
                  <td dir="ltr" style={{ textAlign: 'right' }}>{app.whatsapp}</td>
                  <td>
                    <span className={`dash-badge dash-badge-${app.status}`}>
                      {app.status === 'approved' ? 'مقبول' : app.status === 'pending' ? 'جديد' : 'مرفوض'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {app.status !== 'approved' && (
                        <button 
                          className="dash-btn dash-btn-success dash-btn-sm"
                          onClick={() => updateStatus(app, 'approved')}
                        >
                          قبول
                        </button>
                      )}
                      {app.status !== 'rejected' && (
                        <button 
                          className="dash-btn dash-btn-danger dash-btn-sm"
                          onClick={() => updateStatus(app, 'rejected')}
                        >
                          رفض
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>لا توجد طلبات تطابق الفلتر الحالي</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
