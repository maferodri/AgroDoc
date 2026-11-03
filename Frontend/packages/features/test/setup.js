/**
 * Documento: preparación compartida de las pruebas de features.
 * Levanta MSW, limpia la sesión y restaura los datos simulados entre casos.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetMockDatabase, server } from '@agrodoc/api/mocks';
import { useAuthStore } from '../auth/store/authStore.js';

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    resetMockDatabase();
    useAuthStore.getState().clearSession();
});

afterAll(() => {
    server.close();
});
