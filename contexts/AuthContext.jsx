'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error obteniendo sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Obtener perfil del usuario desde la tabla usuarios
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
    }
  };

  // Función de login
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Obtener perfil del usuario
      await fetchUserProfile(data.user.id);

      return { success: true, data };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de registro
  const signUp = async (userData) => {
    try {
      const { email, password, nombres, apellidos, rut, direccion, telefono } = userData;

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombres,
            apellidos,
          }
        }
      });

      if (authError) throw authError;

      // 2. Crear perfil en tabla usuarios
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authData.user.id,
            email,
            nombres,
            apellidos,
            rut,
            direccion,
            telefono,
            rol: 'vecino', // Rol por defecto
            estado: 'pendiente_aprobacion', // Requiere aprobación de secretaria
          }
        ]);

      if (profileError) throw profileError;

      return { success: true, data: authData };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de logout
  const signOut = async () => {
    try {
      console.log('🚪 Iniciando proceso de logout...');
      
      // 1. Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. Limpiar estado local
      console.log('🧹 Limpiando estado local...');
      setUser(null);
      setUserProfile(null);
      
      // 3. Limpiar localStorage y sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // 4. Limpiar cookies de Supabase
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('🔄 Redirigiendo a página principal...');
        // 5. Usar router de Next.js en lugar de window.location para mantener estilos
        router.push('/');
        
        // 6. Pequeño delay y recarga suave si es necesario
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }, 100);
      }
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // En caso de error, usar router primero
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        router.push('/');
      }
    }
  };

  // Subir comprobante de residencia
  const uploadComprobante = async (userId, file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `comprobantes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      // Actualizar perfil con URL del comprobante
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ comprobante_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    uploadComprobante,
    refreshProfile: () => user && fetchUserProfile(user.id),
  };

  // Solo log cuando hay cambios importantes
  useEffect(() => {
    if (user || userProfile) {
      console.log('🔐 AuthContext actualizado:', { 
        user: user ? 'logged in' : 'logged out', 
        userProfile: userProfile?.rol || 'no profile',
        signOut: !!signOut 
      });
    }
  }, [user, userProfile, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
