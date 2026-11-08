/**
 * Documento: pruebas del cliente HTTP compartido.
 * Verifican la traducción de respuestas y errores del contrato.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { resetMockDatabase, server } from '../src/mocks/index.js';
import { ApiError, getApiBaseUrl, request } from '../src/client.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    resetMockDatabase();
});
afterAll(() => server.close());

describe('request', () => {
    it('usa la URL base local por defecto', () => {
        expect(getApiBaseUrl()).toBe('http://localhost:8000/api/v1');
    });

    it('devuelve el cuerpo JSON de una respuesta correcta', async () => {
        const session = await request('/auth/login', {
            method: 'POST',
            body: { email: 'admin@agrodoc.com', password: 'AgroDoc123' },
        });

        expect(session.user.role).toBe('admin');
    });

    it('traduce los errores HTTP a ApiError', async () => {
        await expect(
            request('/auth/login', {
                method: 'POST',
                body: { email: 'nadie@agrodoc.com', password: 'x' },
            })
        ).rejects.toBeInstanceOf(ApiError);

        await expect(
            request('/users/me')
        ).rejects.toMatchObject({ status: 401, isUnauthorized: true });
    });
});
