'use client';

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import logoImg from '../assets/images/logo4.jpg'
import { useCartStore } from '../store/cartStore'

function Logo({ small = false, scrolled = false }) {
  // Make logo significantly larger by default (e.g. 52px), and shrink it slightly when scrolled
  const size = small ? 32 : (scrolled ? 50 : 64);
  return (
    <Image 
      src={logoImg} 
      alt="شعار لمسة أسرة" 
      className="premium-logo"
      width={size}
      height={size}
      priority
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
  const cartCount = useCartStore((state) => state.getCartCount())
  const openCart = useCartStore((state) => state.openCart)
  const router = useRouter()
  const pathname = usePathname()

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
    
    if (pathname !== '/') {
      router.push('/')
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
        {/* Right - Logo */}
        <div style={{ justifySelf: 'start' }}>
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="premium-brand">
            <Logo scrolled={scrolled} />
            <span className="brand-text">لمسة أسرة</span>
          </a>
        </div>
        
        {/* Center - Links */}
        <nav className="premium-nav">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>الرئيسية</a>
          <a href="#products" onClick={(e) => handleNavClick(e, 'products')}>المنتجات</a>
          <a href="#families" onClick={(e) => handleNavClick(e, 'families')}>الأسر المنتجة</a>
        </nav>

        {/* Left - Actions */}
        <div className="nav-left-container" style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <div className="nav-actions desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Cart Icon */}
            <button onClick={openCart} className="premium-btn" style={{ background: 'transparent', padding: '0 10px', position: 'relative', cursor: 'pointer', border: 'none' }} title="سلة المشتريات">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#b91c1c', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {session ? (
              <button className="premium-btn primary" onClick={onOpenDashboard}>لوحة التحكم</button>
            ) : (
              <>
                <button className="premium-btn outline" onClick={onOpenLogin}>دخول</button>
                <button className="premium-btn primary" onClick={onScrollToJoin}>سجّلي أسرتك</button>
              </>
            )}
          </div>

          {/* Mobile Cart Icon */}
          <button onClick={openCart} className="mobile-cart-btn" style={{ display: 'none', background: 'transparent', border: 'none', position: 'relative' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
             </svg>
             {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#b91c1c', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
             )}
          </button>
          
          <button className={`mobile-menu-btn ${open ? 'active' : ''}`} onClick={() => setOpen(!open)} aria-label="فتح القائمة">
            <span className="hamburger"></span>
          </button>

        </div>
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
