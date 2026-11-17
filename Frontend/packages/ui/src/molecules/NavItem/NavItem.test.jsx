/**
 * Documento: pruebas de la molécula NavItem.
 * Es compartida por la barra web y la móvil, así que vive en @agrodoc/ui.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { light } from '@agrodoc/tokens';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { NavItem } from './NavItem';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('NavItem', () => {
    it('marca el elemento web seleccionado', () => {
        renderWithTheme(<NavItem icon="home" label="Inicio" selected />);

        expect(screen.getByRole('tab', { name: 'Inicio' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
    });

    it('deshabilita el elemento y no dispara onPress', () => {
        const onPress = vi.fn();
        renderWithTheme(
            <NavItem icon="leaf" label="Cultivos" disabled onPress={onPress} />
        );

        const item = screen.getByRole('tab', { name: 'Cultivos' });
        expect(item).toHaveAttribute('aria-disabled', 'true');

        fireEvent.click(item);
        expect(onPress).not.toHaveBeenCalled();
    });
});
