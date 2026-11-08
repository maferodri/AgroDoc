/**
 * Documento: hooks de rol y sesión.
 * Concentran el acceso al store para que las apps no lean su forma interna.
 */
import {
    selectIsAuthenticated,
    selectRole,
    useAuthStore,
} from '../store/authStore.js';

/** Devuelve el rol actual (`farmer`, `agronomist`, `admin`) o `null`. */
export function useRole() {
    return useAuthStore(selectRole);
}

/** Indica si el rol actual pertenece a la lista recibida. */
export function useHasRole(roles) {
    const role = useRole();
    const allowed = Array.isArray(roles) ? roles : [roles];

    return Boolean(role) && allowed.includes(role);
}

/** Estado de sesión que consumen las pantallas y el router. */
export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const clearSession = useAuthStore((state) => state.clearSession);

    return {
        user,
        role: user?.role ?? null,
        isAuthenticated,
        clearSession,
    };
}
