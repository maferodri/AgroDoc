/**
 * Documento: pruebas de la barra superior móvil.
 * Confirma el título paramétrico y el bloqueo de acciones deshabilitadas.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { TopBar } from './TopBar';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('TopBar', () => {
    it('muestra el título y las acciones indicadas', async () => {
        await renderWithTheme(
            <TopBar
                title="Inicio"
                leftAction={{ icon: 'person', label: 'Perfil' }}
                rightActions={[
                    { icon: 'bell', label: 'Notificaciones' },
                ]}
            />
        );

        expect(screen.getByText('Inicio')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Perfil' })).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Notificaciones' })
        ).toBeTruthy();
    });

    it('no dispara acciones deshabilitadas', async () => {
        const onPress = jest.fn();
        await renderWithTheme(
            <TopBar
                title="Inicio"
                leftAction={{
                    icon: 'arrowLeft',
                    label: 'Regresar',
                    onPress,
                    disabled: true,
                }}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', { name: 'Regresar', disabled: true })
        );
        expect(onPress).not.toHaveBeenCalled();
    });
});
