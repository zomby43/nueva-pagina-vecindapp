import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

// Tiempo de inactividad para secretaría (10 minutos en milisegundos)
const SECRETARIA_INACTIVITY_TIMEOUT = 10 * 60 * 1000;

export async function middleware(request) {
  const { supabaseResponse, user, userProfile } = await updateSession(request);

  const path = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(path);

  // Rutas de autenticación
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // ==========================================
  // 1. VERIFICAR SESIÓN EXPIRADA (SECRETARÍA)
  // ==========================================
  if (user && userProfile && userProfile.rol === 'secretaria') {
    const lastActivity = request.cookies.get('last_activity_secretaria')?.value;

    if (lastActivity) {
      const lastActivityTime = parseInt(lastActivity, 10);
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      // Si han pasado más de 10 minutos, cerrar sesión automáticamente
      if (timeSinceLastActivity > SECRETARIA_INACTIVITY_TIMEOUT) {
        console.log('Sesión de secretaría expirada por inactividad');

        // Redirigir a login con mensaje
        const response = NextResponse.redirect(new URL('/login?session_expired=true', request.url));

        // Limpiar cookie de actividad
        response.cookies.delete('last_activity_secretaria');

        // Headers anti-cache
        setAntiCacheHeaders(response);

        return response;
      }
    }

    // Actualizar timestamp de última actividad para secretaría
    supabaseResponse.cookies.set('last_activity_secretaria', Date.now().toString(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hora
    });
  }

  // ==========================================
  // 2. REDIRECCIÓN SI USUARIO LOGUEADO ACCEDE A AUTH PAGES
  // ==========================================
  if (user && userProfile && isAuthRoute) {
    // Si está pendiente de aprobación, permitir acceso a pendiente-aprobacion
    if (userProfile.estado === 'pendiente_aprobacion') {
      const response = NextResponse.redirect(new URL('/pendiente-aprobacion', request.url));
      setAntiCacheHeaders(response);
      return response;
    }

    // Si está activo, redirigir a su dashboard
    if (userProfile.estado === 'activo') {
      const dashboardUrl = getDashboardByRole(userProfile.rol);
      const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
      setAntiCacheHeaders(response);
      return response;
    }
  }

  // ==========================================
  // 3. PROTEGER RUTAS PRIVADAS
  // ==========================================
  if (!user && !isPublicRoute && path !== '/pendiente-aprobacion') {
    // Guardar la ruta a la que intentó acceder (para redirect después del login)
    const response = NextResponse.redirect(new URL('/login', request.url));

    // Guardar ruta original en cookie para redirect inteligente
    if (!isAuthRoute) {
      response.cookies.set('redirect_after_login', path, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 5, // 5 minutos
      });
    }

    setAntiCacheHeaders(response);
    return response;
  }

  // ==========================================
  // 4. VERIFICAR ESTADO DEL USUARIO
  // ==========================================
  if (user && userProfile && !isAuthRoute && !isPublicRoute) {
    // Si está pendiente de aprobación, solo puede acceder a /pendiente-aprobacion
    if (userProfile.estado === 'pendiente_aprobacion') {
      if (path !== '/pendiente-aprobacion') {
        const response = NextResponse.redirect(new URL('/pendiente-aprobacion', request.url));
        setAntiCacheHeaders(response);
        return response;
      }
    }

    // Si está rechazado, redirigir a login
    if (userProfile.estado === 'rechazado') {
      const response = NextResponse.redirect(new URL('/login?rejected=true', request.url));
      setAntiCacheHeaders(response);
      return response;
    }

    // Si está inactivo, redirigir a login
    if (userProfile.estado === 'inactivo') {
      const response = NextResponse.redirect(new URL('/login?inactive=true', request.url));
      setAntiCacheHeaders(response);
      return response;
    }
  }

  // ==========================================
  // 5. PROTECCIÓN DE RUTAS POR ROL
  // ==========================================
  if (user && userProfile && userProfile.estado === 'activo') {
    const rol = userProfile.rol;

    // Rutas de vecino - SOLO para vecinos
    if (path.startsWith('/dashboard') || path.startsWith('/solicitudes') ||
        path.startsWith('/perfil') || path.startsWith('/mapa')) {
      if (rol !== 'vecino') {
        const response = NextResponse.redirect(new URL(getDashboardByRole(rol), request.url));
        setAntiCacheHeaders(response);
        return response;
      }
    }

    // Rutas de secretaría - Para secretaria y admin
    if (path.startsWith('/secretaria')) {
      if (rol !== 'secretaria' && rol !== 'admin') {
        const response = NextResponse.redirect(new URL(getDashboardByRole(rol), request.url));
        setAntiCacheHeaders(response);
        return response;
      }
    }

    // Rutas de admin - SOLO para admin
    if (path.startsWith('/admin')) {
      if (rol !== 'admin') {
        const response = NextResponse.redirect(new URL(getDashboardByRole(rol), request.url));
        setAntiCacheHeaders(response);
        return response;
      }
    }
  }

  // ==========================================
  // 6. APLICAR HEADERS ANTI-CACHE A TODAS LAS RESPUESTAS
  // ==========================================
  setAntiCacheHeaders(supabaseResponse);

  return supabaseResponse;
}

/**
 * Aplica headers anti-cache a una respuesta
 */
function setAntiCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
}

function getDashboardByRole(rol) {
  switch (rol) {
    case 'admin':
      return '/admin/dashboard';
    case 'secretaria':
      return '/secretaria/dashboard';
    case 'vecino':
      return '/dashboard';
    default:
      return '/';
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (logo.png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$).*)',
  ],
};
