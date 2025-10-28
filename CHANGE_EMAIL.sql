-- ============================================================
-- SCRIPT PARA CAMBIAR EL EMAIL DE UN USUARIO
-- ============================================================
-- Útil cuando quieres reutilizar un email para pruebas sin borrar datos

-- Paso 1: Cambiar email en la tabla usuarios
UPDATE public.usuarios 
SET email = 'nuevo_email_temporal@example.com' 
WHERE email = 'email_que_quieres_liberar@example.com';

-- Paso 2: Cambiar email en auth.users (esto libera el email para nuevo registro)
UPDATE auth.users 
SET email = 'nuevo_email_temporal@example.com',
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{email}',
      '"nuevo_email_temporal@example.com"'
    )
WHERE email = 'email_que_quieres_liberar@example.com';

-- ============================================================
-- EJEMPLO DE USO:
-- ============================================================
-- Si quieres liberar el email 'juan@example.com':
/*
UPDATE public.usuarios 
SET email = 'juan_viejo@example.com' 
WHERE email = 'juan@example.com';

UPDATE auth.users 
SET email = 'juan_viejo@example.com',
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{email}',
      '"juan_viejo@example.com"'
    )
WHERE email = 'juan@example.com';
*/

-- Ahora puedes usar 'juan@example.com' para registrar un nuevo usuario
