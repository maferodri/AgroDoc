/**
 * Documento: hook de registro (HU1.2).
 * Crea el usuario, inicia sesión automáticamente y cachea el perfil.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';
import { authKeys } from './queryKeys.js';

export function useRegister() {
    const setSession = useAuthStore((state) => state.setSession);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerUser,
        onSuccess: (session) => {
            setSession(session);
            queryClient.setQueryData(authKeys.me, session.user);
        },
    });
}
