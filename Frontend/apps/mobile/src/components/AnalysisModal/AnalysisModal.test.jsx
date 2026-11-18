/**
 * Documento: pruebas del modal del estado del análisis.
 * Verifican el indicador de carga, el check final y la navegación al resultado.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { AnalysisModal } from './AnalysisModal';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('AnalysisModal', () => {
    it('muestra la carga mientras se analiza la foto', async () => {
        await renderWithTheme(<AnalysisModal visible status="loading" />);

        expect(screen.getByTestId('analysis-loading')).toBeTruthy();
        expect(screen.getByText('Analizando Imagen...')).toBeTruthy();
    });

    it('confirma el análisis y permite continuar al resultado', async () => {
        const onContinue = jest.fn();
        await renderWithTheme(
            <AnalysisModal
                visible
                status="success"
                onContinue={onContinue}
            />
        );

        expect(
            screen.getByText('Análisis Finalizado Con Éxito')
        ).toBeTruthy();
        expect(
            screen.getByRole('button', {
                name: 'Continuar',
                disabled: false,
            })
        ).toBeTruthy();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Continuar' })
        );
        expect(onContinue).toHaveBeenCalled();
    });
});
