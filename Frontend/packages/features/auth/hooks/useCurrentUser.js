/**
 * Documento: hook del perfil autenticado (`/users/me`).
 * Refresca el usuario en el store, detecta tokens inválidos y evita la
 * consulta cuando no hay sesión.
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';
import { authKeys } from './queryKeys.js';

export function useCurrentUser({ enabled = true } = {}) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const setUser = useAuthStore((state) => state.setUser);
    const clearSession = useAuthStore((state) => state.clearSession);

    const query = useQuery({
        queryKey: authKeys.me,
        queryFn: ({ signal }) => getMyProfile(accessToken, { signal }),
        enabled: enabled && Boolean(accessToken),
        staleTime: 5 * 60 * 1000,
        // Un 401 no se reintenta: significa que la sesión ya no sirve.
        retry: (failureCount, error) =>
            !error?.isUnauthorized && failureCount < 1,
    });

    // Mantiene sincronizado el store con el perfil que devuelve el backend.
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    // Si el token expiró, se cierra la sesión para que los guards redirijan.
    useEffect(() => {
        if (query.error?.isUnauthorized) {
            clearSession();
        }
    }, [query.error, clearSession]);

    return query;
}
