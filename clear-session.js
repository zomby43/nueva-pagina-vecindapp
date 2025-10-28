// Script para limpiar el almacenamiento local y cookies
// Ejecuta esto en la consola del navegador para limpiar completamente la sesión

// Limpiar localStorage
localStorage.clear();

// Limpiar sessionStorage
sessionStorage.clear();

// Limpiar todas las cookies relacionadas con Supabase
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Limpiar cookies específicas de la aplicación
const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token', 
    'last_activity_secretaria',
    'supabase-auth-token',
    'supabase.auth.token'
];

cookiesToClear.forEach(cookie => {
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
});

console.log('✅ Limpieza completa realizada. Recarga la página.');

// Opcional: recargar la página automáticamente
// window.location.reload();