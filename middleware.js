import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { supabaseResponse, user, userProfile } = await updateSession(request);

  const path = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(path);

  // Rutas de autenticación
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // Si el usuario está logueado y trata de acceder a login/register, redirigir a su dashboard
  if (user && userProfile && isAuthRoute) {
    const dashboardUrl = getDashboardByRole(userProfile.rol);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Si el usuario no está logueado y trata de acceder a rutas protegidas
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si el usuario está logueado pero su perfil no está aprobado
  if (user && userProfile && userProfile.estado === 'pendiente_aprobacion' && !isAuthRoute) {
    // Permitir acceso a una página de "pendiente de aprobación"
    if (path !== '/pendiente-aprobacion') {
      return NextResponse.redirect(new URL('/pendiente-aprobacion', request.url));
    }
  }

  // Protección de rutas según rol
  if (user && userProfile) {
    const rol = userProfile.rol;

    // Rutas de vecino - SOLO para vecinos
    if (path.startsWith('/dashboard') || path.startsWith('/solicitudes') ||
        path.startsWith('/perfil') || path.startsWith('/mapa')) {
      if (rol !== 'vecino') {
        return NextResponse.redirect(new URL(getDashboardByRole(rol), request.url));
      }
    }

    // Rutas de secretaría
    if (path.startsWith('/secretaria')) {
      if (rol !== 'secretaria' && rol !== 'admin') {
        return NextResponse.redirect(new URL(getDashboardByRole(rol), request.url));
      }
    }

    // Rutas de admin
    if (path.startsWith('/admin')) {
      if (rol !== 'admin') {
        return NextResponse.redirect(new URL(getDashboardByRole(rol), request.url));
      }
    }
  }

  return supabaseResponse;
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
