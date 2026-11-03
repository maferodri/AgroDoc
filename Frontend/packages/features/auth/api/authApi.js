/**
 * Documento: servicios del feature auth.
 * Cada función llama a un endpoint de autenticación y valida la respuesta con
 * los esquemas del contrato, de modo que los hooks reciban datos confiables.
 */
import { request } from '@agrodoc/api';
import {
    agronomistListSchema,
    authResponseSchema,
    loginRequestSchema,
    recoverPasswordSchema,
    refreshTokenSchema,
    registerRequestSchema,
    userSchema,
} from '../schemas/authSchemas.js';

/**
 * Registra un agricultor o agrónomo y devuelve la sesión ya iniciada.
 *
 * @param {object} input Datos del formulario de registro.
 * @returns {Promise<object>} `AuthResponse` validado.
 */
export async function registerUser(input) {
    const body = registerRequestSchema.parse(input);
    const response = await request('/auth/register', { method: 'POST', body });

    return authResponseSchema.parse(response);
}

/**
 * Inicia sesión con correo y contraseña.
 *
 * @param {{ email: string, password: string }} input Credenciales.
 * @returns {Promise<object>} `AuthResponse` validado.
 */
export async function loginUser(input) {
    const body = loginRequestSchema.parse(input);
    const response = await request('/auth/login', { method: 'POST', body });

    return authResponseSchema.parse(response);
}

/**
 * Renueva el token de acceso usando el refresh token.
 *
 * @param {string} refreshToken Token de refresco vigente.
 * @returns {Promise<object>} `AuthResponse` validado.
 */
export async function refreshSession(refreshToken) {
    const body = refreshTokenSchema.parse({ refresh_token: refreshToken });
    const response = await request('/auth/refresh', { method: 'POST', body });

    return authResponseSchema.parse(response);
}

/**
 * Revoca la sesión en el backend.
 *
 * @param {{ refreshToken: string, accessToken?: string }} session Tokens actuales.
 * @returns {Promise<void>}
 */
export async function logoutUser({ refreshToken, accessToken }) {
    const body = refreshTokenSchema.parse({ refresh_token: refreshToken });

    await request('/auth/logout', { method: 'POST', body, token: accessToken });
}

/**
 * Solicita el correo de recuperación de contraseña.
 *
 * @param {{ email: string }} input Correo del usuario.
 * @returns {Promise<{ message: string }>} Confirmación del backend.
 */
export async function requestPasswordReset(input) {
    const body = recoverPasswordSchema.parse(input);

    return request('/auth/recover-password', { method: 'POST', body });
}

/**
 * Obtiene el perfil del usuario autenticado.
 *
 * @param {string} accessToken Token Bearer.
 * @param {{ signal?: AbortSignal }} [options] Cancelación de la consulta.
 * @returns {Promise<object>} `User` validado.
 */
export async function getMyProfile(accessToken, { signal } = {}) {
    const response = await request('/users/me', { token: accessToken, signal });

    return userSchema.parse(response);
}

/**
 * Lista los agrónomos disponibles (usado al asignar consultas).
 *
 * @param {{ accessToken: string, availableOnly?: boolean, signal?: AbortSignal }} options
 * @returns {Promise<object[]>} Lista de agrónomos con perfil.
 */
export async function listAgronomists({ accessToken, availableOnly = true, signal } = {}) {
    const query = availableOnly ? '?available_only=true' : '?available_only=false';
    const response = await request(`/agronomists${query}`, {
        token: accessToken,
        signal,
    });

    return agronomistListSchema.parse(response);
}
