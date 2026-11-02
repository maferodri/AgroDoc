/**
 * Documento: hook de cierre de sesión.
 * Revoca el token en el backend y limpia siempre el estado local, incluso si
 * la red falla, para no dejar una sesión a medias.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';
import { authKeys } from './queryKeys.js';

export function useLogout() {
    const clearSession = useAuthStore((state) => state.clearSession);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { accessToken, refreshToken } = useAuthStore.getState();

            if (!refreshToken) {
                return;
            }

            await logoutUser({ accessToken, refreshToken });
        },
        onSettled: () => {
            clearSession();
            queryClient.removeQueries({ queryKey: authKeys.all });
        },
    });
}
