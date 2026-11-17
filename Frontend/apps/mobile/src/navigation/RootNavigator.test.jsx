/**
 * Documento: pruebas de navegación móvil por rol.
 * Confirman que el administrador no tiene acceso móvil, que el agricultor
 * llega a su inicio y que la cámara se abre desde la barra inferior.
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
    LogoutButton: () => null,
}));

// Evita depender del módulo nativo de la cámara en las pruebas.
jest.mock('expo-camera', () => {
    const React = require('react');

    return {
        CameraView: React.forwardRef((props, ref) => {
            React.useImperativeHandle(ref, () => ({
                takePictureAsync: async () => ({
                    uri: 'file:///tmp/cultivo.jpg',
                }),
            }));

            return null;
        }),
        useCameraPermissions: () => [
            { granted: true, canAskAgain: true },
            jest.fn(),
        ],
    };
});

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

    it('muestra el inicio del agricultor', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            role: 'farmer',
        });

        await renderNavigator();

        expect(screen.getByText('Buenos Días')).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Fotografía' })
        ).toBeTruthy();
    });

    it('abre la cámara desde la barra inferior y regresa al inicio', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            role: 'farmer',
        });

        await renderNavigator();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Fotografía' })
        );
        expect(screen.getByText('Captura')).toBeTruthy();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Regresar' })
        );
        expect(screen.getByText('Buenos Días')).toBeTruthy();
    });

    it('muestra la verificación de la imagen después de tomar la foto', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            role: 'farmer',
        });

        await renderNavigator();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Fotografía' })
        );
        await fireEvent.press(
            screen.getByRole('button', { name: 'Tomar foto' })
        );

        expect(await screen.findByText('Vista Previa')).toBeTruthy();
        expect(screen.getByText('Análisis')).toBeTruthy();
        expect(
            screen.getByRole('button', {
                name: 'Subir Desde Galería',
                disabled: true,
            })
        ).toBeTruthy();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Regresar' })
        );
        expect(screen.getByText('Buenos Días')).toBeTruthy();
    });

    it('muestra el login cuando no hay sesión', async () => {
        useAuth.mockReturnValue({
            isAuthenticated: false,
            role: null,
        });

        await renderNavigator();

        expect(screen.getByText('Iniciar Sesión')).toBeTruthy();
    });
});
