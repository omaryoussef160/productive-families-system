'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer } from './Header';
import { Hero } from './Hero';
import { ProductsFilterableList } from './ProductsFilterableList';
import { HowItWorks } from './HowItWorks';
import { FamiliesSection } from './FamiliesSection';
import { JoinSection } from './JoinSection';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';

export function HomeStorefront({ initialProducts = [], initialFamilyCount = 0 }) {
  const { session, logout } = useAuth();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [notice, setNotice] = useState('');
  const router = useRouter();

  const closeModal = () => setActiveModal(null);

  const scrollToJoin = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      setTimeout(() => {
        document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLogout = async () => {
    const res = await logout();
    if (res?.error) {
      setNotice('حدث خطأ أثناء تسجيل الخروج');
      return;
    }
    setActiveModal(null);
    setNotice('تم تسجيل الخروج بنجاح');
  };

  const handleSelectFamily = (family) => {
    setSelectedFamily(family);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <Header
        session={session}
        onScrollToJoin={scrollToJoin}
        onOpenLogin={() => setActiveModal('auth')}
        onOpenDashboard={() => router.push('/dashboard')}
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
        <Hero onJoin={scrollToJoin} familyCount={initialFamilyCount} />
        <ProductsFilterableList
          products={initialProducts}
          selectedFamily={selectedFamily}
          onClearFamilyFilter={() => setSelectedFamily(null)}
        />
        <HowItWorks />
        <FamiliesSection onSelectFamily={handleSelectFamily} />
        {!session && <JoinSection onNotice={setNotice} onOpenLogin={() => setActiveModal('auth')} />}
      </main>

      <Footer />
    </>
  );
}
