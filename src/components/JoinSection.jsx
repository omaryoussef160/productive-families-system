import { useState } from 'react'
import { categories } from '../data/catalog'
import { isConfigured, supabase } from '../supabase'
import joinArt from '../join-art.jpg'

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

const initialValues = { family_name: '', city: '', category: categories[0], whatsapp: '', bio: '', password: '' }

function validate(values) {
  const errors = {}
  const phone = values.whatsapp.replace(/[\s-]/g, '')
  
  if (values.family_name.trim().length < 3) errors.family_name = 'اكتبي اسم النشاط أو الأسرة (3 حروف على الأقل).'
  if (values.city.trim().length < 2) errors.city = 'اكتبي المدينة أو المحافظة.'
  if (!/^(?:(?:\+20|20|0)?1[0125][0-9]{8})$/.test(phone)) errors.whatsapp = 'اكتبي رقم واتساب مصري صحيح، مثال: 01012345678.'
  if (values.bio.trim() && values.bio.trim().length < 10) errors.bio = 'النبذة قصيرة جدًا، اكتبي 10 حروف على الأقل أو اتركيها فارغة.'
  if (values.password.length < 6) errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'
  
  return errors
}

export function JoinSection({ onNotice, onOpenLogin }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function change(event) {
    const { name, value } = event.target
    const next = { ...values, [name]: value }
    setValues(next)
    if (errors[name]) setErrors(validate(next))
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    
    if (Object.keys(nextErrors).length) return
    
    if (!isConfigured) return onNotice('سيعمل التسجيل الحقيقي بعد ربط Supabase.')
    
    setLoading(true)
    
    const email = phoneToEmail(values.whatsapp)
    const normalizedPhone = toEgyptE164(values.whatsapp)
    
    const { error } = await supabase.auth.signUp({
      email,
      password: values.password,
      options: {
        data: {
          family_name: values.family_name.trim(),
          city: values.city.trim(),
          whatsapp: normalizedPhone,
          category: values.category,
          bio: values.bio.trim()
        }
      }
    })
    
    setLoading(false)
    
    if (error) return onNotice(error.message)
    setSent(true)
  }

  const field = (name) => errors[name] ? 'has-error' : values[name] ? 'is-filled' : ''

  return (
    <section id="join" className="join-section">
      <div className="join-card">
        <div className="join-form-side">
          <div className="join-heading">
          <span>لو عندك أسرة منتجة؟ انضمي للمنصة</span>
          <h2>سجّلي نشاطك دلوقتي</h2>
          <p>املئي البيانات، وهنراجع طلبك قبل ظهور منتجاتك على المنصة.</p>
        </div>
        
        {sent ? (
          <div className="join-success">
            <div className="success-icon">✓</div>
            <b>تم إرسال طلبك بنجاح</b>
            <span>هنراجع البيانات ونتواصل معك على واتساب بعد القبول.</span>
            <button onClick={() => { setSent(false); setValues(initialValues) }}>تسجيل نشاط آخر</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="join-row">
              <label className={field('family_name')}>
                <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>اسم النشاط / الأسرة <i>*</i></span></span>
                <input name="family_name" value={values.family_name} onChange={change} placeholder="مثال: أسرة أم يوسف" aria-invalid={Boolean(errors.family_name)} />
                {errors.family_name && <small>{errors.family_name}</small>}
              </label>
              <label className={field('city')}>
                <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>المدينة / المحافظة <i>*</i></span></span>
                <input name="city" value={values.city} onChange={change} placeholder="مثال: بورسعيد" aria-invalid={Boolean(errors.city)} />
                {errors.city && <small>{errors.city}</small>}
              </label>
            </div>
            
            <label className={field('category')}>
              <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>نوع المنتجات <i>*</i></span></span>
              <select name="category" value={values.category} onChange={change}>
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
            </label>
            
            <div className="join-row" style={{ alignItems: 'start' }}>
              <label className={field('whatsapp')}>
                <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>رقم واتساب <i>*</i></span></span>
                <input
                  name="whatsapp"
                  value={values.whatsapp}
                  onChange={change}
                  inputMode="tel"
                  dir="ltr"
                  placeholder="مثال: 01012345678"
                  aria-invalid={Boolean(errors.whatsapp)}
                />
                {errors.whatsapp ? <small>{errors.whatsapp}</small> : <em>سنستخدمه للتواصل معك بعد المراجعة.</em>}
              </label>
              
              <label className={field('password')}>
                <span><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>كلمة المرور <i>*</i></span></span>
                <div style={{ position: 'relative', display: 'flex', width: '100%' }}>
                  <input
                    name="password"
                    value={values.password}
                    onChange={change}
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="••••••"
                    aria-invalid={Boolean(errors.password)}
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
                {errors.password ? <small>{errors.password}</small> : <em style={{ visibility: 'hidden' }}>.</em>}
              </label>
            </div>
            
            <label className={field('bio')}>
              <span>نبذة قصيرة عن نشاطك <strong>اختياري</strong></span>
              <textarea name="bio" value={values.bio} onChange={change} rows="3" placeholder="بنشتغل كروشيه ومفارش يدوية من ١٥ سنة..." aria-invalid={Boolean(errors.bio)} />
              {errors.bio && <small>{errors.bio}</small>}
            </label>
            
            <button className="join-submit" disabled={loading}>
              {loading ? 'جارٍ إرسال الطلب...' : (
                <>
                  إرسال طلب التسجيل 
                  <svg className="submit-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </>
              )}
            </button>
            
            <p className="join-privacy"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: "middle", marginLeft: "6px"}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> بياناتك لن تظهر للعامة إلا بعد موافقتك وقبول الطلب.</p>
            <p className="join-privacy" style={{ marginTop: '10px', fontSize: '13px' }}>
              عندك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={onOpenLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fbbf24',
                  fontWeight: '700',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  padding: 0
                }}
              >
                سجّلي دخول من هنا
              </button>
            </p>
          </form>
        )}
        </div>
        <div className="join-art-side">
          <div className="s-curve-divider"></div>
          <img src={joinArt} alt="أسرة منتجة" />
        </div>
      </div>
    </section>
  )
}
