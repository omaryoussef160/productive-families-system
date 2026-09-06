'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Dashboard } from '../../components/Dashboard';
import { revalidateStorefront } from '../actions';


export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const [notice, setNotice] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className="dash-container"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          display: 'flex',
        }}
      >
        <div style={{ fontSize: '18px', color: 'var(--dash-accent, #b91c1c)' }}>
          جاري التحقق من الحساب...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleBack = () => {
    revalidateStorefront();
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['familyCount'] });
    router.push('/');
  };

  const handleRefreshProducts = () => {
    revalidateStorefront();
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <>
      {notice && (
        <div className="notice">
          {notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}
      <Dashboard
        session={session}
        onBack={handleBack}
        onRefreshProducts={handleRefreshProducts}
        onNotice={setNotice}
      />
    </>
  );
}
