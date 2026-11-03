/**
 * Documento: rutas centralizadas de la app web.
 * Define las rutas públicas y el lobby inicial que corresponde a cada rol.
 */

export const ROUTES = {
    login: '/login',
    register: '/register',
    playground: '/playground',
    farmerLobby: '/agricultor',
    agronomistLobby: '/agronomo',
    adminLobby: '/admin',
};

/** Lobby inicial según el rol devuelto por el backend. */
export const ROLE_HOME = {
    farmer: ROUTES.farmerLobby,
    agronomist: ROUTES.agronomistLobby,
    admin: ROUTES.adminLobby,
};

/**
 * Devuelve la ruta inicial del rol; si no se reconoce, vuelve al login.
 *
 * @param {string|null} role Rol del usuario autenticado.
 * @returns {string} Ruta del lobby o del login.
 */
export function getHomeRoute(role) {
    return ROLE_HOME[role] ?? ROUTES.login;
}
