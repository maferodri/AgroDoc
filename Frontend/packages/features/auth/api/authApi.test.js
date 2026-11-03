/**
 * Documento: pruebas del feature auth contra MSW.
 * Verifican login por rol, registro, recuperación y lectura de agrónomos sin
 * tocar servicios reales.
 */
import { describe, expect, it } from 'vitest';
import {
    listAgronomists,
    loginUser,
    registerUser,
    requestPasswordReset,
} from '../api/authApi.js';

describe('authApi con MSW', () => {
    it('inicia sesión como administrador', async () => {
        const session = await loginUser({
            email: 'admin@agrodoc.com',
            password: 'AgroDoc123',
        });

        expect(session.user.role).toBe('admin');
        expect(session.access_token).toContain('access.');
    });

    it('inicia sesión como agricultor y agrónomo', async () => {
        const farmer = await loginUser({
            email: 'agricultor@agrodoc.com',
            password: 'AgroDoc123',
        });
        const agronomist = await loginUser({
            email: 'agronomo@agrodoc.com',
            password: 'AgroDoc123',
        });

        expect(farmer.user.role).toBe('farmer');
        expect(agronomist.user.role).toBe('agronomist');
    });

    it('rechaza credenciales inválidas con 401', async () => {
        await expect(
            loginUser({
                email: 'nadie@agrodoc.com',
                password: 'AgroDoc123',
            })
        ).rejects.toMatchObject({ status: 401, isUnauthorized: true });
    });

    it('registra una cuenta nueva', async () => {
        const session = await registerUser({
            full_name: 'Nuevo Agricultor',
            email: 'nuevo@agrodoc.com',
            password: 'AgroDoc123',
        });

        expect(session.user.email).toBe('nuevo@agrodoc.com');
        expect(session.user.role).toBe('farmer');
    });

    it('devuelve conflicto si el correo ya existe', async () => {
        await expect(
            registerUser({
                full_name: 'Duplicado',
                email: 'admin@agrodoc.com',
                password: 'AgroDoc123',
            })
        ).rejects.toMatchObject({ status: 409, isConflict: true });
    });

    it('solicita recuperación de contraseña', async () => {
        const response = await requestPasswordReset({
            email: 'agricultor@agrodoc.com',
        });

        expect(response.message).toContain('agricultor@agrodoc.com');
    });

    it('lista agrónomos con sesión válida', async () => {
        const session = await loginUser({
            email: 'agricultor@agrodoc.com',
            password: 'AgroDoc123',
        });
        const agronomists = await listAgronomists({
            accessToken: session.access_token,
        });

        expect(agronomists).toHaveLength(1);
        expect(agronomists[0].profile.specialty).toBe('Fitopatología');
    });
});
