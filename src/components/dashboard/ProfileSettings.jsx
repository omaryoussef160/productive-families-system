import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function ProfileSettings({ profile, session, onNotice, onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    family_name: '',
    city: '',
    whatsapp: '',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        family_name: profile.family_name || '',
        city: profile.city || '',
        whatsapp: profile.whatsapp || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          family_name: formData.family_name,
          city: formData.city,
          whatsapp: formData.whatsapp,
          bio: formData.bio
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      onNotice('تم تحديث الملف الشخصي بنجاح', 'success');
      if (onProfileUpdate) onProfileUpdate();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      onNotice('حدث خطأ أثناء التحديث', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-form">
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
        <h3 className="dash-heading" style={{ fontSize: '18px', marginBottom: '16px' }}>تغيير كلمة المرور 🔑</h3>
        <PasswordChangeForm onNotice={onNotice} />
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
      onNotice('تم تغيير كلمة المرور بنجاح ✅', 'success');
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
