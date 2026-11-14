/**
 * Documento: pruebas de los componentes de feedback.
 * Cubren Badge, Alert y ConfidenceBar con todas sus variantes y umbrales.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { light } from '@agrodoc/tokens';
import { Badge } from '../src/atoms/Badge/Badge';
import { ConfidenceBar } from '../src/molecules/ConfidenceBar/ConfidenceBar';
import { Alert } from '../src/organisms/Alert/Alert';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('Badge', () => {
    it.each([
        ['healthy', 'Saludable'],
        ['warning', 'Atención'],
        ['danger', 'Riesgo'],
        ['premium', 'Premium'],
    ])('renderiza la variante %s', (variant, label) => {
        renderWithTheme(<Badge variant={variant}>{label}</Badge>);

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByTestId(`badge-${variant}`)).toBeInTheDocument();
    });
});

describe('Alert', () => {
    it.each([
        ['info', 'Información'],
        ['weather', 'Clima'],
        ['critical', 'Crítico'],
    ])('renderiza la variante %s', (variant, title) => {
        renderWithTheme(
            <Alert variant={variant} title={title} message="Detalle" />
        );

        expect(screen.getByRole('alert')).toHaveTextContent(title);
        expect(screen.getByText('Detalle')).toBeInTheDocument();
        expect(screen.getByTestId(`alert-${variant}`)).toBeInTheDocument();
    });
});

describe('ConfidenceBar', () => {
    it('muestra el entero y el nivel alto', () => {
        renderWithTheme(<ConfidenceBar value={92.8} />);

        expect(screen.getByTestId('confidence-value')).toHaveTextContent('93%');
        expect(screen.getByTestId('confidence-bar')).toHaveAttribute(
            'data-level',
            'high'
        );
        expect(screen.queryByTestId('confidence-hint')).not.toBeInTheDocument();
    });

    it('cambia a nivel medio y no deriva al agrónomo', () => {
        renderWithTheme(<ConfidenceBar value={64.2} />);

        expect(screen.getByTestId('confidence-value')).toHaveTextContent('64%');
        expect(screen.getByTestId('confidence-bar')).toHaveAttribute(
            'data-level',
            'medium'
        );
        expect(screen.queryByTestId('confidence-hint')).not.toBeInTheDocument();
    });

    it('cambia a nivel bajo y recomienda un agrónomo', () => {
        renderWithTheme(<ConfidenceBar value={34.7} />);

        expect(screen.getByTestId('confidence-value')).toHaveTextContent('35%');
        expect(screen.getByTestId('confidence-bar')).toHaveAttribute(
            'data-level',
            'low'
        );
        expect(screen.getByTestId('confidence-hint')).toHaveTextContent(
            'consultar a un agrónomo'
        );
    });

    it('recorta valores fuera de rango', () => {
        renderWithTheme(<ConfidenceBar value={150} />);

        expect(screen.getByTestId('confidence-value')).toHaveTextContent('100%');
    });
});
