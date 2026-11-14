/**
 * Documento: pruebas del enrutamiento protegido web.
 * Verifican el destino por rol y que un agricultor no entre a /admin.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@agrodoc/features';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES, getHomeRoute } from './routes';

const setRole = (role) => {
    useAuthStore.getState().setSession({
        access_token: 'access.token',
        refresh_token: 'refresh.token',
        user: {
            id: '22222222-2222-4222-8222-222222222222',
            email: `${role}@agrodoc.com`,
            full_name: `Usuario ${role}`,
            role,
            is_active: true,
            created_at: '2026-01-15T10:00:00.000Z',
        },
    });
};

const renderRoute = (path) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <div>Panel admin</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/agricultor" element={<div>Lobby agricultor</div>} />
                <Route path="/login" element={<div>Login</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('getHomeRoute', () => {
    it('devuelve el lobby de cada rol', () => {
        expect(getHomeRoute('admin')).toBe(ROUTES.adminLobby);
        expect(getHomeRoute('farmer')).toBe(ROUTES.farmerLobby);
        expect(getHomeRoute('agronomist')).toBe(ROUTES.agronomistLobby);
        expect(getHomeRoute('desconocido')).toBe(ROUTES.login);
    });
});

describe('ProtectedRoute', () => {
    afterEach(() => {
        useAuthStore.getState().clearSession();
    });

    it('redirige al login sin sesión', () => {
        renderRoute('/admin');

        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('redirige al agricultor fuera de /admin', () => {
        setRole('farmer');
        renderRoute('/admin');

        expect(screen.getByText('Lobby agricultor')).toBeInTheDocument();
        expect(screen.queryByText('Panel admin')).not.toBeInTheDocument();
    });

    it('permite el acceso al administrador', () => {
        setRole('admin');
        renderRoute('/admin');

        expect(screen.getByText('Panel admin')).toBeInTheDocument();
    });
});
