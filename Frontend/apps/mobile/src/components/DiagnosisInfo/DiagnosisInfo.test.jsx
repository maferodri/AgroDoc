/**
 * Documento: pruebas del organismo de información del diagnóstico.
 * Confirman la foto, el patógeno y la confianza recibidos por props.
 */
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { DiagnosisInfo } from './DiagnosisInfo';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

const PHOTO = { uri: 'file:///tmp/cultivo.jpg' };

describe('DiagnosisInfo', () => {
    it('muestra la foto, el patógeno y la confianza', async () => {
        await renderWithTheme(
            <DiagnosisInfo
                photo={PHOTO}
                pestName="Cafe Roya"
                confidence={92}
            />
        );

        expect(
            screen.getByRole('image', {
                name: 'Foto del cultivo diagnosticado',
            })
        ).toBeTruthy();
        expect(screen.getByText('RESULTADO')).toBeTruthy();
        expect(screen.getByText('Cafe Roya')).toBeTruthy();
        expect(screen.getByText('92%')).toBeTruthy();
    });
});
