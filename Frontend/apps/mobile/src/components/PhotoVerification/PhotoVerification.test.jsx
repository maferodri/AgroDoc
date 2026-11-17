/**
 * Documento: pruebas del organismo de verificación de la foto.
 * Confirma el título, la foto, las acciones y el consejo de iluminación.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { PhotoVerification } from './PhotoVerification';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

const PHOTO = { uri: 'file:///tmp/cultivo.jpg' };

describe('PhotoVerification', () => {
    it('muestra la foto, las acciones y el consejo', async () => {
        const onRetake = jest.fn();

        await renderWithTheme(
            <PhotoVerification photo={PHOTO} onRetake={onRetake} />
        );

        expect(screen.getByText('Vista Previa')).toBeTruthy();
        expect(
            screen.getByRole('image', { name: 'Foto lista para analizar' })
        ).toBeTruthy();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Volver a Tomar Foto' })
        );
        expect(onRetake).toHaveBeenCalled();

        expect(
            screen.getByRole('button', {
                name: 'Subir Desde Galería',
                disabled: true,
            })
        ).toBeTruthy();
        expect(screen.getByText('Buena Iluminación')).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Continuar' })
        ).toBeTruthy();
    });
});
