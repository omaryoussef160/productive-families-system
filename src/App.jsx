import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { Footer, Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProductsSection } from './components/ProductsSection'
import { HowItWorks } from './components/HowItWorks'
import { FamiliesSection } from './components/FamiliesSection'
import { JoinSection } from './components/JoinSection'
import { AuthModal } from './components/AuthModal'
import { Dashboard } from './components/Dashboard'
import { CartDrawer } from './components/CartDrawer'
import { supabase, isConfigured } from './config/supabase'
import { useProducts } from './hooks/useProducts'
import { useFamilyCount } from './hooks/useFamilies'

export default function App() {
  const { data: products = [], refetch: refetchProducts, isLoading: isProductsLoading } = useProducts()
  const { data: familyCount = 0, refetch: refetchFamilyCount } = useFamilyCount()
  
  const [category, setCategory] = useState('الكل')
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [session, setSession] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isConfigured) return

    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    
    return () => listener.subscription.unsubscribe()
  }, [])

  const closeModal = () => setActiveModal(null)
  const scrollToJoin = () => {
    if (session) {
      navigate('/dashboard')
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      setNotice('حدث خطأ أثناء تسجيل الخروج')
      return
    }
    setSession(null)
    setActiveModal(null)
    navigate('/')
    setNotice('تم تسجيل الخروج بنجاح')
  }

  const handleSelectFamily = (family) => {
    setSelectedFamily(family)
    navigate('/')
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <>
      <CartDrawer />
      <Routes>
        <Route path="/dashboard" element={
          session ? (
            <>
              {notice && (
                <div className="notice">
                  {notice}
                  <button onClick={() => setNotice('')}>×</button>
                </div>
              )}
              <Dashboard
                session={session}
                onBack={() => { refetchProducts(); refetchFamilyCount(); navigate('/'); }}
                onRefreshProducts={refetchProducts}
                onNotice={setNotice}
              />
            </>
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/" element={
          <>
            <Header
              session={session}
              onScrollToJoin={scrollToJoin}
              onOpenLogin={() => setActiveModal('auth')}
              onOpenDashboard={() => navigate('/dashboard')}
              onLogout={handleLogout}
            />
            
            {notice && (
               <div className="notice">
                {notice}
                <button onClick={() => setNotice('')}>×</button>
              </div>
            )}
            
            {activeModal === 'auth' && (
              <AuthModal onClose={closeModal} onNotice={setNotice} onScrollToJoin={scrollToJoin} />
            )}
            
            <main className={activeModal ? 'dim' : ''}>
              <Hero onJoin={scrollToJoin} familyCount={familyCount} />
              <ProductsSection
                products={products}
                selectedCategory={category}
                onCategoryChange={setCategory}
                selectedFamily={selectedFamily}
                onClearFamilyFilter={() => setSelectedFamily(null)}
                isConfigured={isConfigured}
              />
              <HowItWorks />
              <FamiliesSection onSelectFamily={handleSelectFamily} />
              {!session && <JoinSection onNotice={setNotice} onOpenLogin={() => setActiveModal('auth')} />}
            </main>
            
            <Footer />
          </>
        } />
      </Routes>
    </>
  )
}
