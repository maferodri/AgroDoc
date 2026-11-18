/**
 * Documento: pruebas de las moléculas del diagnóstico.
 * Confirman el nombre del patógeno y el porcentaje de confianza.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { light } from '@agrodoc/tokens';
import { ThemeProvider } from './theme/ThemeProvider';
import { ConfidenceScore } from './molecules/ConfidenceScore/ConfidenceScore';
import { PestName } from './molecules/PestName/PestName';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('PestName', () => {
    it('muestra la etiqueta y el nombre del patógeno', () => {
        renderWithTheme(<PestName name="Cafe Roya" />);

        expect(screen.getByText('Patógeno:')).toBeInTheDocument();
        expect(screen.getByText('Cafe Roya')).toBeInTheDocument();
    });
});

describe('ConfidenceScore', () => {
    it('redondea el porcentaje de confianza', () => {
        renderWithTheme(<ConfidenceScore value={92.6} />);

        expect(screen.getByText('Confianza')).toBeInTheDocument();
        expect(screen.getByText('93%')).toBeInTheDocument();
    });
});
