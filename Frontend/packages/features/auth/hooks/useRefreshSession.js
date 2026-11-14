/**
 * Documento: hook para renovar el token de acceso.
 * Usa el refresh token vigente y reemplaza la sesión completa con la respuesta
 * de `/auth/refresh`.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { refreshSession } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';
import { authKeys } from './queryKeys.js';

export function useRefreshSession() {
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const setSession = useAuthStore((state) => state.setSession);
    const clearSession = useAuthStore((state) => state.clearSession);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!refreshToken) {
                throw new Error('No hay una sesión que renovar.');
            }

            return refreshSession(refreshToken);
        },
        onSuccess: (session) => {
            setSession(session);
            queryClient.setQueryData(authKeys.me, session.user);
        },
        onError: (error) => {
            // Solo un 401 invalida la sesión; un fallo de red se puede reintentar.
            if (!error?.isUnauthorized) {
                return;
            }

            clearSession();
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
    });
}
