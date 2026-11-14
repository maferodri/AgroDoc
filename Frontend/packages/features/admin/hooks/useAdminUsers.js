/**
 * Documento: hooks del panel de administración.
 * Cachean la lista de usuarios y actualizan la fila afectada tras el cambio.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore.js';
import { listUsers, setUserActive } from '../api/adminApi.js';

export const adminKeys = {
    all: ['admin'],
    users: ['admin', 'users'],
};

/** Lista las cuentas registradas (solo administradores). */
export function useAdminUsers({ enabled = true } = {}) {
    const accessToken = useAuthStore((state) => state.accessToken);

    return useQuery({
        queryKey: adminKeys.users,
        queryFn: ({ signal }) => listUsers({ accessToken, signal }),
        enabled: enabled && Boolean(accessToken),
    });
}

/** Activa o desactiva un usuario y refresca la lista. */
export function useSetUserActive() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input) => setUserActive(input, { accessToken }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users });
        },
    });
}
