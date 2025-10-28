-- ============================================================
-- SCRIPT PARA ELIMINAR USUARIO Y TODOS SUS DATOS RELACIONADOS
-- ============================================================
-- Reemplaza 'ID_DEL_USUARIO_AQUI' con el ID UUID del usuario que quieres borrar

-- 1. Primero, eliminar todos los datos relacionados del usuario
DELETE FROM public.proyectos WHERE usuario_id = 'ID_DEL_USUARIO_AQUI';
DELETE FROM public.solicitudes WHERE usuario_id = 'ID_DEL_USUARIO_AQUI';
DELETE FROM public.reservas WHERE usuario_id = 'ID_DEL_USUARIO_AQUI' OR atendido_por = 'ID_DEL_USUARIO_AQUI';
DELETE FROM public.postulaciones WHERE usuario_id = 'ID_DEL_USUARIO_AQUI';
DELETE FROM public.avisos WHERE creado_por = 'ID_DEL_USUARIO_AQUI';
DELETE FROM public.noticias WHERE creado_por = 'ID_DEL_USUARIO_AQUI';

-- 2. Eliminar el perfil del usuario de la tabla usuarios
DELETE FROM public.usuarios WHERE id = 'ID_DEL_USUARIO_AQUI';

-- 3. Eliminar el usuario de auth (opcional, si quieres liberar el email completamente)
-- DELETE FROM auth.users WHERE id = 'ID_DEL_USUARIO_AQUI';

-- ============================================================
-- NOTA: Si quieres mantener algunos datos (como proyectos o solicitudes)
-- pero solo borrar el usuario, primero actualiza esos registros para 
-- asignarlos a otro usuario o ponerlos como NULL (si la columna lo permite)
-- ============================================================

-- Ejemplo: Transferir proyectos a otro usuario antes de borrar
-- UPDATE public.proyectos 
-- SET usuario_id = 'ID_DE_OTRO_USUARIO' 
-- WHERE usuario_id = 'ID_DEL_USUARIO_AQUI';
