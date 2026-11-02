/**
 * Documento: claves de caché de auth para React Query.
 * Centralizarlas permite invalidar toda la sesión con una sola clave.
 */
export const authKeys = {
    all: ['auth'],
    me: ['auth', 'me'],
};
