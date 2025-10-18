import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Re-exporta el hook desde AuthContext para mantener la convención de hooks separados
 */
export const useAuth = useAuthContext;

export default useAuth;
