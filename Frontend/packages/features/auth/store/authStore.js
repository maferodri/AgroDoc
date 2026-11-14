/**
 * Documento: store de sesión del feature auth (Zustand).
 * Mantiene tokens y usuario para que navegación, guards y pantallas consulten
 * la sesión sin depender de React Query. Se hidrata desde el almacenamiento
 * local al importarse.
 */
import { create } from 'zustand';
import {
    clearStoredSession,
    readStoredSession,
    writeStoredSession,
} from './tokenStorage.js';

const initialSession = readStoredSession();

export const useAuthStore = create((set, get) => ({
    /** Usuario autenticado o `null` si no hay sesión. */
    user: initialSession?.user ?? null,
    /** Token Bearer para llamadas protegidas. */
    accessToken: initialSession?.access_token ?? null,
    /** Token para renovar la sesión. */
    refreshToken: initialSession?.refresh_token ?? null,

    /**
     * Guarda la sesión devuelta por login, registro o refresh.
     *
     * @param {{ access_token: string, refresh_token: string, user: object }} session
     */
    setSession(session) {
        writeStoredSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user,
        });

        set({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            user: session.user,
        });
    },

    /**
     * Actualiza solo el usuario (p. ej. tras `/users/me` o al editar perfil)
     * sin tocar los tokens vigentes.
     *
     * @param {object} user Usuario validado.
     */
    setUser(user) {
        const { accessToken, refreshToken } = get();

        if (accessToken && refreshToken) {
            writeStoredSession({
                access_token: accessToken,
                refresh_token: refreshToken,
                user,
            });
        }

        set({ user });
    },

    /** Borra la sesión local (logout o token inválido). */
    clearSession() {
        clearStoredSession();
        set({ user: null, accessToken: null, refreshToken: null });
    },
}));

/** Selector: hay tokens guardados. */
export const selectIsAuthenticated = (state) => Boolean(state.accessToken);

/** Selector: rol actual o `null` mientras se carga el perfil. */
export const selectRole = (state) => state.user?.role ?? null;
