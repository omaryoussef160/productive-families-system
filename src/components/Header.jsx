import { useState } from 'react'

function Logo({ small = false }) {
  return (
    <svg viewBox="0 0 40 40" className={small ? 'source-logo source-logo-small' : 'source-logo'} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="4" fill="#b91c1c" />
      <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="#fbbf24" />
      <circle cx="20" cy="20" r="3.5" fill="#1c1917" />
    </svg>
  )
}

export function Header({ session, onScrollToJoin, onOpenLogin, onOpenDashboard }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="source-header">
      <div className="source-nav-inner">
        <a href="#home" className="source-brand">
          <Logo />
          <span>لمسة أسرة</span>
        </a>
        
        <nav className="source-nav">
          <a href="#home">الرئيسية</a>
          <a href="#products">المنتجات</a>
          <a href="#families">الأسر المنتجة</a>
          
          {session ? (
            <button onClick={onOpenDashboard}>لوحة أسرتي</button>
          ) : (
            <>
              <button className="outline-btn" onClick={onOpenLogin} style={{ background: 'transparent', color: '#b91c1c', border: '1px solid #b91c1c' }}>دخول</button>
              <button onClick={onScrollToJoin}>سجّلي أسرتك</button>
            </>
          )}
        </nav>
        
        <button className="source-menu-button" onClick={() => setOpen(!open)} aria-label="فتح القائمة">
          {open ? '×' : '☰'}
        </button>
      </div>
      
      {open && (
        <div className="source-mobile-menu">
          <a onClick={() => setOpen(false)} href="#home">الرئيسية</a>
          <a onClick={() => setOpen(false)} href="#products">المنتجات</a>
          <a onClick={() => setOpen(false)} href="#families">الأسر المنتجة</a>
          
          {session ? (
            <button onClick={() => { setOpen(false); onOpenDashboard() }}>لوحة أسرتي</button>
          ) : (
            <>
              <button onClick={() => { setOpen(false); onOpenLogin() }} style={{ background: 'transparent', color: '#b91c1c', border: '1px solid #b91c1c', marginBottom: '8px' }}>دخول</button>
              <button onClick={() => { setOpen(false); onScrollToJoin() }}>سجّلي أسرتك</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="source-footer">
      <div>
        <span className="source-brand source-footer-brand">
          <Logo small />
          <b>لمسة أسرة</b>
        </span>
        <p>منصة تجريبية للأسر المنتجة — جاهزة تتخصص باسم مشروعك وبياناتك.</p>
      </div>
    </footer>
  )
}
