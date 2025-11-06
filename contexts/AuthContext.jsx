'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logLogin, logLogout } from '@/lib/logs/createLog';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileFetched, setProfileFetched] = useState(false); // Evitar fetch múltiples
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      try {
        console.log('🚀 AuthContext: Iniciando obtención de sesión...');
        const { data: { session } } = await supabase.auth.getSession();

        console.log('📋 Sesión obtenida:', session?.user ? 'Usuario autenticado' : 'Sin usuario');

        if (session?.user) {
          console.log('👤 Usuario ID:', session.user.id);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('❌ No hay sesión activa');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ Error getting session:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        console.log('✅ AuthContext: Carga inicial completada');
        setLoading(false);
      }
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user ? 'Usuario presente' : 'Sin usuario');

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

  const fetchUserProfile = async (userId, forceRefresh = false) => {
    // Evitar fetch múltiples si ya se obtuvo el perfil
    if (profileFetched && !forceRefresh) {
      console.log('⚡ Profile already fetched, skipping...');
      return;
    }

    try {
      console.log('🔍 Fetching profile for user:', userId);

      // Intentar cargar del cache primero
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile && !forceRefresh) {
        const profile = JSON.parse(cachedProfile);
        console.log('📦 Profile loaded from cache:', profile.rol);
        setUserProfile(profile);
        setProfileFetched(true);
        return;
      }

      // Agregar timeout para evitar bucles infinitos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        // Si es error de recursión infinita, no lanzar excepción, solo logear
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          console.warn('⚠️ RLS recursion detected, profile fetch skipped');
          setUserProfile(null);
          setProfileFetched(true);
          return;
        }
        console.error('❌ Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Profile loaded:', data.rol, data.nombres);
        setUserProfile(data);
        setProfileFetched(true);
        // Guardar en cache
        localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
      } else {
        console.warn('⚠️ No profile data returned');
        setUserProfile(null);
        setProfileFetched(true);
      }
    } catch (error) {
      // Si el error es de abort (timeout), manejarlo silenciosamente
      if (error.name === 'AbortError') {
        console.warn('⚠️ Profile fetch timeout - possible RLS issue');
        setUserProfile(null);
        setProfileFetched(true);
        return;
      }
      console.error('❌ Error fetching profile:', error);
      setUserProfile(null);
      setProfileFetched(true);
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

      // Registrar log de login exitoso
      try {
        const perfil = await supabase
          .from('usuarios')
          .select('id, email, nombres, apellidos')
          .eq('id', data.user.id)
          .single();

        if (perfil.data) {
          await logLogin({
            id: perfil.data.id,
            email: perfil.data.email,
            nombre: `${perfil.data.nombres} ${perfil.data.apellidos}`
          });
        }
      } catch (logError) {
        console.error('Error al registrar log de login:', logError);
        // No interrumpir el login si falla el log
      }

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
      // Registrar log de logout ANTES de cerrar sesión
      try {
        if (userProfile) {
          await logLogout({
            id: userProfile.id,
            email: userProfile.email,
            nombre: `${userProfile.nombres} ${userProfile.apellidos}`
          });
        }
      } catch (logError) {
        console.error('Error al registrar log de logout:', logError);
        // Continuar con el logout aunque falle el log
      }

      // 1. Limpiar estado local primero
      setUser(null);
      setUserProfile(null);
      setProfileFetched(false);
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
