/**
 * Documento: pruebas de la barra inferior móvil.
 * Confirma que solo Inicio y la cámara quedan habilitados.
 */
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { BottomNav } from './BottomNav';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('BottomNav', () => {
    it('solo deja habilitados Inicio y la cámara', async () => {
        await renderWithTheme(<BottomNav />);

        expect(
            screen.getByRole('tab', { name: 'Inicio', selected: true })
        ).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Fotografía' })
        ).toBeTruthy();

        ['Cultivos', 'Pagos', 'Ajustes'].forEach((label) => {
            expect(
                screen.getByRole('tab', { name: label, disabled: true })
            ).toBeTruthy();
        });
    });

    it('deshabilita la cámara cuando captureDisabled es true', async () => {
        await renderWithTheme(<BottomNav captureDisabled />);

        expect(
            screen.getByRole('button', { name: 'Fotografía', disabled: true })
        ).toBeTruthy();
    });
});
