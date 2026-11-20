/**
 * Documento: pruebas de navegación móvil por rol.
 * Confirman que el administrador no tiene acceso móvil y que el agricultor
 * sí llega a su flujo de diagnóstico.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { useAuth } from '@agrodoc/features';
import RootNavigator from './RootNavigator';

jest.mock('@agrodoc/features', () => ({
    useAuth: jest.fn(),
    useLoginForm: () => ({
        email: '',
        password: '',
        errors: {},
        error: '',
        loading: false,
        setEmail: jest.fn(),
        setPassword: jest.fn(),
        submit: jest.fn(),
    }),
    useRecoverPasswordForm: () => ({
        email: '',
        errors: {},
        message: '',
        error: '',
        loading: false,
        setEmail: jest.fn(),
        submit: jest.fn(),
    }),
    useConfirmPasswordResetForm: () => ({
        code: '',
        newPassword: '',
        confirmPassword: '',
        errors: {},
        error: '',
        loading: false,
        setCode: jest.fn(),
        setNewPassword: jest.fn(),
        setConfirmPassword: jest.fn(),
        reset: jest.fn(),
        submit: jest.fn(),
    }),
    LogoutButton: () => null,
    DiagnosisResult: () => null,
    useAnalyzeDiagnosis: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateConsultation: () => ({ mutate: jest.fn() }),
}));

const renderNavigator = () =>
    render(
        <ThemeProvider theme={light}>
            <RootNavigator />
        </ThemeProvider>
    );

describe('RootNavigator', () => {
    it('bloquea el panel de administración en móvil', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            role: 'admin',
        });

        await renderNavigator();

        expect(
            screen.getByText('Acceso no disponible en móvil')
        ).toBeTruthy();
    });

    it('muestra el flujo de diagnóstico al agricultor', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            role: 'farmer',
        });

        await renderNavigator();

        expect(screen.getByText('Diagnóstico de cultivos')).toBeTruthy();
        expect(screen.getByText('Tomar foto')).toBeTruthy();
    });

    it('muestra el login cuando no hay sesión', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: false,
            role: null,
        });

        await renderNavigator();

        expect(screen.getByText('Iniciar Sesión')).toBeTruthy();
    });

    it('abre la recuperación de contraseña desde el login', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: false,
            role: null,
        });

        await renderNavigator();
        fireEvent.press(screen.getByText('¿Olvidaste tu contraseña?'));

        expect(await screen.findByText('Restablecer Contraseña')).toBeTruthy();
    });
});
