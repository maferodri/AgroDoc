/**
 * Documento: hook de inicio de sesión (HU1.1).
 * Ejecuta `loginUser`, guarda la sesión en el store y deja el perfil en caché.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';
import { authKeys } from './queryKeys.js';

export function useLogin() {
    const setSession = useAuthStore((state) => state.setSession);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (session) => {
            setSession(session);
            queryClient.setQueryData(authKeys.me, session.user);
        },
    });
}
