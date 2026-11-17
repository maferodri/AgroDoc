/**
 * Documento: pruebas de la barra lateral web del agricultor.
 * Verifica las secciones visibles y el bloqueo por `disabledKeys`.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { light } from '@agrodoc/tokens';
import { ThemeProvider } from '@agrodoc/ui';
import { SidebarNav } from './SidebarNav';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('SidebarNav', () => {
    it('muestra las secciones web con Consultas seleccionada', () => {
        renderWithTheme(<SidebarNav />);

        expect(screen.getByText('AGRODOC')).toBeInTheDocument();
        expect(
            screen.getByText('SUSCRIPCIÓN PREMIUM')
        ).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Consultas' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        expect(screen.getByRole('tab', { name: 'Historial' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Cerrar Sesión' })).toBeInTheDocument();
    });

    it('deshabilita las claves indicadas', () => {
        renderWithTheme(
            <SidebarNav disabledKeys={['crops', 'premium', 'logout']} />
        );

        expect(screen.getByRole('tab', { name: 'Cultivos' })).toHaveAttribute(
            'aria-disabled',
            'true'
        );
        expect(
            screen.getByRole('button', { name: 'SUSCRIPCIÓN PREMIUM' })
        ).toHaveAttribute('aria-disabled', 'true');
        expect(
            screen.getByRole('tab', { name: 'Cerrar Sesión' })
        ).toHaveAttribute('aria-disabled', 'true');
    });
});
