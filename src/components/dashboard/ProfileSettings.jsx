import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import joinArt from '../../assets/images/join-art.jpg';
import { categories } from '../../data/catalog';

export default function ProfileSettings({ profile, session, onNotice, onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    family_name: '',
    city: '',
    whatsapp: '',
    category: categories[0] || '',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        family_name: profile.family_name || '',
        city: profile.city || '',
        whatsapp: profile.whatsapp || '',
        category: profile.category || categories[0] || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        family_name: formData.family_name,
        city: formData.city,
        whatsapp: formData.whatsapp,
        category: formData.category,
        bio: formData.bio
      };

      let { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', session.user.id);

      if (error && error.message?.includes("Could not find the `category` column of `profiles` in the schema cache")) {
        const { error: fallbackError } = await supabase
          .from('profiles')
          .update({
            family_name: formData.family_name,
            city: formData.city,
            whatsapp: formData.whatsapp,
            bio: formData.bio
          })
          .eq('id', session.user.id);

        if (fallbackError) throw fallbackError;
        onNotice('تم تحديث بياناتك، لكن الفئة لم تُسجّل لأن العمود غير موجود في قاعدة البيانات بعد. شغّل ترحيل الفئة.', 'warning');
        if (onProfileUpdate) onProfileUpdate();
        return;
      }

      if (error) throw error;
      onNotice('تم تحديث الملف الشخصي بنجاح', 'success');
      if (onProfileUpdate) onProfileUpdate();

    } catch (err) {
      console.error('Error updating profile:', err);
      onNotice(err?.message || 'حدث خطأ أثناء التحديث', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="dash-profile-card">
        <div className="dash-profile-form-side">
          <div style={{ marginBottom: '32px' }}>
            <h2 className="dash-heading" style={{ fontSize: '28px', color: '#b91c1c', marginBottom: '8px' }}>تعديل الملف الشخصي</h2>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>حدثي بيانات أسرتك المنتجة وأرقام التواصل لضمان وصول طلبات العملاء.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
        <div className="dash-form-group">
          <label className="dash-label">اسم الأسرة المنتجة</label>
          <input
            type="text"
            required
            className="dash-input"
            value={formData.family_name}
            onChange={(e) => setFormData({...formData, family_name: e.target.value})}
          />
        </div>

        <div className="dash-form-row">
          <div className="dash-form-group">
            <label className="dash-label">المدينة</label>
            <input
              type="text"
              required
              className="dash-input"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>

          <div className="dash-form-group">
            <label className="dash-label">رقم الواتساب</label>
            <input
              type="text"
              required
              className="dash-input"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              dir="ltr"
            />
          </div>
        </div>

        <div className="dash-form-group">
          <label className="dash-label">نوع المنتجات</label>
          <select
            required
            className="dash-select"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="dash-form-group">
          <label className="dash-label">نبذة عن الأسرة وما تقدمه</label>
          <textarea
            className="dash-textarea"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>

        <button 
          type="submit" 
          className="dash-btn dash-btn-primary dash-btn-lg" 
          disabled={loading}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </form>

      {/* Password Change Section */}
      <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--dash-border)' }}>
        <h3 className="dash-heading" style={{ fontSize: '18px', marginBottom: '16px' }}><div style={{display: "flex", alignItems: "center", color: "#374151"}}>تغيير كلمة المرور <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg></div></h3>
        <PasswordChangeForm onNotice={onNotice} />
      </div>
        </div>
        
        <div className="dash-profile-art-side">
          <div className="dash-s-curve-divider"></div>
          <img src={joinArt} alt="أسرة منتجة" />
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm({ onNotice }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return onNotice('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
    if (newPassword !== confirmPassword) return onNotice('كلمتا المرور غير متطابقتين', 'error');

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      onNotice('تم تغيير كلمة المرور بنجاح', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      onNotice(err.message || 'حدث خطأ أثناء تغيير كلمة المرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordChange}>
      <div className="dash-form-row">
        <div className="dash-form-group">
          <label className="dash-label">كلمة المرور الجديدة</label>
          <input
            type="password"
            required
            className="dash-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••"
            dir="ltr"
          />
        </div>
        <div className="dash-form-group">
          <label className="dash-label">تأكيد كلمة المرور</label>
          <input
            type="password"
            required
            className="dash-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••"
            dir="ltr"
          />
        </div>
      </div>
      <button type="submit" className="dash-btn dash-btn-primary" disabled={loading}>
        {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
      </button>
    </form>
  );
}
