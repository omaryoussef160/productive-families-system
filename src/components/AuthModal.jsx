import { useState } from 'react'
import { supabase, isConfigured } from '../supabase'

/* Convert any Egyptian phone format to a consistent email for Supabase auth.
   01012345678 → 201012345678@osra.local
   +201012345678 → 201012345678@osra.local */
function phoneToEmail(value) {
  const digits = value.replace(/\D/g, '')
  const normalized = digits.startsWith('20') ? digits : digits.startsWith('0') ? `20${digits.slice(1)}` : `20${digits}`
  return `${normalized}@osra.local`
}

export function AuthModal({ onClose, onNotice }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isConfigured) return onNotice('أنشئ مشروع Supabase وأضف بياناته في .env.local أولًا.')

    const form = new FormData(event.currentTarget)
    const rawPhone = form.get('phone')
    const password = form.get('password')
    const email = phoneToEmail(rawPhone)

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      if (error.message.includes('Invalid login')) return onNotice('رقم الموبايل أو كلمة المرور غير صحيحة.')
      return onNotice(error.message)
    }
    onNotice('تم تسجيل الدخول بنجاح.')
    onClose()
  }

  return (
    <div className="modal-wrap">
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        <p className="eyebrow red">أهلًا بعودتك</p>
        <h2>الدخول برقم الموبايل</h2>

        <form onSubmit={handleSubmit}>
          <label>رقم الموبايل / واتساب
            <input name="phone" type="tel" dir="ltr" placeholder="01012345678" required />
          </label>

          <label>كلمة المرور
            <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                minLength="6"
                placeholder="••••••"
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
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
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
            {loading ? 'جارٍ التحميل...' : 'دخول'}
          </button>
        </form>

        <p className="switch">
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
            ليس لديك حساب؟ سجّلي من الصفحة الرئيسية
          </button>
        </p>
      </div>
    </div>
  )
}
