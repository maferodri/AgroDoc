/**
 * Documento: servicios de administración de usuarios.
 * Listan cuentas y permiten activarlas o desactivarlas desde el panel web.
 */
import { request } from '@agrodoc/api';
import { z } from 'zod';
import { userSchema } from '../../auth/schemas/authSchemas.js';

export const adminUserListSchema = z.array(userSchema);

/**
 * Lista todos los usuarios de la plataforma.
 *
 * @param {{ accessToken: string, signal?: AbortSignal }} options Sesión.
 * @returns {Promise<object[]>} Usuarios validados.
 */
export async function listUsers({ accessToken, signal } = {}) {
    const response = await request('/admin/users', {
        token: accessToken,
        signal,
    });

    return adminUserListSchema.parse(response);
}

/**
 * Activa o desactiva una cuenta.
 *
 * @param {{ userId: string, isActive: boolean }} input Cambio solicitado.
 * @param {{ accessToken: string }} [options] Sesión del administrador.
 * @returns {Promise<object>} Usuario actualizado.
 */
export async function setUserActive(
    { userId, isActive },
    { accessToken } = {}
) {
    const response = await request(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: { is_active: isActive },
        token: accessToken,
    });

    return userSchema.parse(response);
}
