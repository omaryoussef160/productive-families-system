'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfigured } from '../config/supabase';

const AuthContext = createContext({
  session: null,
  setSession: () => {},
  logout: async () => {},
  isLoading: true,
  isConfigured: false,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setIsLoading(false);
    }).catch((err) => {
      console.error('Error fetching session:', err);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (!supabase) return { success: false };
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
    setSession(null);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ session, setSession, logout, isLoading, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
