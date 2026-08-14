import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logoImg from '../logo4.jpg'

function Logo({ small = false, scrolled = false }) {
  // Make logo significantly larger by default (e.g. 52px), and shrink it slightly when scrolled
  const size = small ? 32 : (scrolled ? 50 : 64);
  return (
    <img 
      src={logoImg} 
      alt="شعار لمسة أسرة" 
      className="premium-logo"
      style={{ 
        width: size, 
        height: size, 
        objectFit: 'contain',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        mixBlendMode: small ? 'normal' : 'multiply',
        borderRadius: small ? '8px' : '0',
        backgroundColor: small ? 'white' : 'transparent'
      }}
    />
  )
}

export function Header({ session, onScrollToJoin, onOpenLogin, onOpenDashboard, onLogout }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    setOpen(false) // close mobile menu if open
    
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    } else {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`premium-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="premium-nav-inner">
        <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="premium-brand">
          <Logo scrolled={scrolled} />
          <span className="brand-text">لمسة أسرة</span>
        </a>
        
        <nav className="premium-nav">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>الرئيسية</a>
          <a href="#products" onClick={(e) => handleNavClick(e, 'products')}>المنتجات</a>
          <a href="#families" onClick={(e) => handleNavClick(e, 'families')}>الأسر المنتجة</a>
          
          <div className="nav-actions">
            {session ? (
              <button className="premium-btn primary" onClick={onOpenDashboard}>لوحة التحكم</button>
            ) : (
              <>
                <button className="premium-btn outline" onClick={onOpenLogin}>دخول</button>
                <button className="premium-btn primary" onClick={onScrollToJoin}>سجّلي أسرتك</button>
              </>
            )}
          </div>
        </nav>

        <button className={`mobile-menu-btn ${open ? 'active' : ''}`} onClick={() => setOpen(!open)} aria-label="فتح القائمة">
          <span className="hamburger"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`premium-mobile-drawer ${open ? 'open' : ''}`}>
        <div className="drawer-content">
          <a onClick={(e) => handleNavClick(e, 'home')} href="#home">الرئيسية</a>
          <a onClick={(e) => handleNavClick(e, 'products')} href="#products">المنتجات</a>
          <a onClick={(e) => handleNavClick(e, 'families')} href="#families">الأسر المنتجة</a>
          
          <div className="drawer-actions">
            {session ? (
              <> 
                <button className="premium-btn primary w-full" onClick={() => { setOpen(false); onOpenDashboard() }}>
                  لوحة التحكم
                </button>
                <button className="premium-btn outline w-full" onClick={() => { setOpen(false); onLogout?.() }}>
                  خروج
                </button>
              </>
            ) : (
              <>
                <button className="premium-btn primary w-full" onClick={() => { setOpen(false); onScrollToJoin() }}>
                  سجّلي أسرتك
                </button>
                <button className="premium-btn outline w-full" onClick={() => { setOpen(false); onOpenLogin() }}>
                  دخول
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Backdrop for mobile drawer */}
      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)}></div>}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="source-footer">
      <div>
        <span className="source-brand source-footer-brand">
          <Logo small={true} />
          <b style={{ marginRight: '8px' }}>لمسة أسرة</b>
        </span>
        <p>منصة تجريبية للأسر المنتجة — جاهزة تتخصص باسم مشروعك وبياناتك.</p>
      </div>
    </footer>
  )
}
