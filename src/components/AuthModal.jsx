'use client';

import { useState } from 'react'
import { supabase, isConfigured } from '../config/supabase'


function phoneToEmail(value) {
  const digits = value.replace(/\D/g, '')
  const normalized = digits.startsWith('20') ? digits : digits.startsWith('0') ? `20${digits.slice(1)}` : `20${digits}`
  return `${normalized}@osra.local`
}

function toEgyptE164(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('20')) return `+${digits}`
  if (digits.startsWith('0')) return `+20${digits.slice(1)}`
  return `+${digits}`
}

export function AuthModal({ onClose, onNotice, onScrollToJoin }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // view can be 'login' or 'signup-customer'
  const [view, setView] = useState('login')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isConfigured) return onNotice('أنشئ مشروع Supabase وأضف بياناته في .env.local أولًا.')
    
    setLoading(true)
    const email = phoneToEmail(form.phone)

    if (view === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: form.password })
      setLoading(false)
      if (error) {
        if (error.message.includes('Invalid login')) return onNotice('رقم الموبايل أو كلمة المرور غير صحيحة.')
        return onNotice(error.message)
      }
      onNotice('تم تسجيل الدخول بنجاح.')
      onClose()
    } else {
      // Customer Signup
      const normalizedPhone = toEgyptE164(form.phone)
      
      const { error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            family_name: form.name.trim(), // We use family_name to store the user's name for consistency
            whatsapp: normalizedPhone,
            role: 'customer'
          }
        }
      })
      setLoading(false)
      
      if (error) return onNotice(error.message)
      
      onNotice('تم إنشاء حساب المشتري بنجاح! يمكنك الآن تسجيل الدخول.')
      setView('login')
    }
  }

  return (
    <div className="modal-wrap">
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          <button 
            type="button"
            onClick={() => setView('login')}
            style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: view === 'login' ? '2px solid #0f766e' : 'none', color: view === 'login' ? '#0f766e' : '#78716c', fontWeight: 'bold', cursor: 'pointer' }}
          >
            تسجيل الدخول
          </button>
          <button 
            type="button"
            onClick={() => setView('signup-customer')}
            style={{ flex: 1, padding: '8px', background: 'none', border: 'none', borderBottom: view === 'signup-customer' ? '2px solid #0f766e' : 'none', color: view === 'signup-customer' ? '#0f766e' : '#78716c', fontWeight: 'bold', cursor: 'pointer' }}
          >
            حساب مشتري جديد
          </button>
        </div>

        <h2>{view === 'login' ? 'الدخول برقم الموبايل' : 'إنشاء حساب مشتري'}</h2>

        <form onSubmit={handleSubmit}>
          {view === 'signup-customer' && (
            <label>الاسم بالكامل
              <input name="name" type="text" placeholder="مثال: عمر محمد" value={form.name} onChange={handleChange} required />
            </label>
          )}

          <label>رقم الموبايل / واتساب
            <input name="phone" type="tel" dir="ltr" placeholder="01012345678" value={form.phone} onChange={handleChange} required />
          </label>

          <label>كلمة المرور
            <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                minLength="6"
                placeholder="••••••"
                value={form.password} onChange={handleChange}
                required
                style={{ flex: 1, paddingLeft: '42px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#a8a29e', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button disabled={loading}>
            {loading ? 'جارٍ التحميل...' : (view === 'login' ? 'دخول' : 'إنشاء حساب')}
          </button>
        </form>

        {view === 'login' && (
          <p className="switch">
            <button type="button" onClick={() => { onClose(); onScrollToJoin && onScrollToJoin(); }} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
              صاحب أسرة منتجة؟ سجل نشاطك من هنا
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
