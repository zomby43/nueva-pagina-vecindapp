'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Profile loaded:', data.rol, data.nombres);
        setUserProfile(data);
      } else {
        console.warn('⚠️ No profile data returned');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setUserProfile(null);
    }
  };

  // Login con carga forzada de perfil
  const signIn = async (email, password) => {
    try {
      // Limpiar estado previo
      setUser(null);
      setUserProfile(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Forzar actualización de estado
      setUser(data.user);
      await fetchUserProfile(data.user.id);
      setLoading(false);

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout con limpieza completa
  const signOut = async () => {
    try {
      // 1. Limpiar estado local primero
      setUser(null);
      setUserProfile(null);
      setLoading(true);

      // 2. Cerrar sesión en Supabase
      await supabase.auth.signOut();

      // 3. Limpiar todo el storage del navegador
      localStorage.clear();
      sessionStorage.clear();

      // 4. Pequeña espera para asegurar limpieza
      await new Promise(resolve => setTimeout(resolve, 100));

      // 5. Redirigir a home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Forzar limpieza y recarga incluso si hay error
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
