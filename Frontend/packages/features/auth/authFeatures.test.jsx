/**
 * Documento: pruebas de formularios y guard de auth.
 * Validan la lógica compartida por web y móvil: errores por campo, mensajes
 * del backend y restricción de rutas por rol.
 */
import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './store/authStore.js';
import { useLoginForm } from './hooks/useLoginForm.js';
import { useRecoverPasswordForm } from './hooks/useRecoverPasswordForm.js';
import { useRegisterForm } from './hooks/useRegisterForm.js';
import { RoleGuard } from './components/RoleGuard.jsx';
import { renderHookWithQuery } from '../test/renderWithQuery.jsx';

const farmer = {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'agricultor@agrodoc.com',
    full_name: 'María Agricultora',
    role: 'farmer',
    is_active: true,
    created_at: '2026-01-15T10:00:00.000Z',
};

describe('useLoginForm', () => {
    it('muestra errores de validación antes de llamar a la API', () => {
        const { result } = renderHookWithQuery(() => useLoginForm());

        act(() => {
            result.current.setEmail('correo-invalido');
            result.current.submit();
        });

        expect(result.current.errors.email).toBeTruthy();
        expect(result.current.loading).toBe(false);
    });

    it('inicia sesión y guarda el usuario en el store', async () => {
        const onSuccess = vi.fn();
        const { result } = renderHookWithQuery(() =>
            useLoginForm({ onSuccess })
        );

        act(() => {
            result.current.setEmail('admin@agrodoc.com');
            result.current.setPassword('AgroDoc123');
        });

        await act(async () => {
            result.current.submit();
        });

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(useAuthStore.getState().user.role).toBe('admin');
    });

    it('traduce el 401 a un mensaje de credenciales', async () => {
        const { result } = renderHookWithQuery(() => useLoginForm());

        act(() => {
            result.current.setEmail('nadie@agrodoc.com');
            result.current.setPassword('AgroDoc123');
        });

        await act(async () => {
            result.current.submit();
        });

        await waitFor(() =>
            expect(result.current.error).toBe(
                'Usuario o contraseña incorrectos.'
            )
        );
    });
});

describe('useRegisterForm', () => {
    it('rechaza contraseñas distintas', () => {
        const { result } = renderHookWithQuery(() => useRegisterForm());

        act(() => {
            result.current.setFullName('María Agricultora');
        });
        act(() => {
            result.current.setEmail('maria@agrodoc.com');
        });
        act(() => {
            result.current.setPassword('AgroDoc123');
        });
        act(() => {
            result.current.setConfirmPassword('OtraClave1');
        });
        act(() => {
            result.current.submit();
        });

        expect(result.current.errors.confirmPassword).toBe(
            'Las contraseñas no coinciden.'
        );
    });

    it('registra al agricultor cuando los datos son válidos', async () => {
        const { result } = renderHookWithQuery(() => useRegisterForm());

        act(() => {
            result.current.setFullName('María Agricultora');
        });
        act(() => {
            result.current.setEmail('maria@agrodoc.com');
        });
        act(() => {
            result.current.setPassword('AgroDoc123');
        });
        act(() => {
            result.current.setConfirmPassword('AgroDoc123');
        });

        await act(async () => {
            result.current.submit();
        });

        await waitFor(() =>
            expect(useAuthStore.getState().user?.email).toBe(
                'maria@agrodoc.com'
            )
        );
    });
});

describe('useRecoverPasswordForm', () => {
    it('valida el correo y devuelve un mensaje neutro', async () => {
        const { result } = renderHookWithQuery(() =>
            useRecoverPasswordForm()
        );

        act(() => {
            result.current.setEmail('no-es-correo');
            result.current.submit();
        });
        expect(result.current.errors.email).toBeTruthy();

        act(() => {
            result.current.setEmail('agricultor@agrodoc.com');
        });

        await act(async () => {
            result.current.submit();
        });

        await waitFor(() =>
            expect(result.current.message).toContain('Si el correo está registrado')
        );
    });
});

describe('RoleGuard', () => {
    const setRole = (role) =>
        useAuthStore.getState().setSession({
            access_token: 'access.token',
            refresh_token: 'refresh.token',
            user: { ...farmer, role },
        });

    it('muestra el contenido cuando el rol está permitido', () => {
        setRole('admin');

        render(
            <RoleGuard roles={['admin']}>
                <span>Panel admin</span>
            </RoleGuard>
        );

        expect(screen.getByText('Panel admin')).toBeInTheDocument();
    });

    it('muestra el fallback cuando el rol no está permitido', () => {
        setRole('farmer');

        render(
            <RoleGuard roles={['admin']} fallback={<span>Sin acceso</span>}>
                <span>Panel admin</span>
            </RoleGuard>
        );

        expect(screen.getByText('Sin acceso')).toBeInTheDocument();
        expect(screen.queryByText('Panel admin')).not.toBeInTheDocument();
    });
});
