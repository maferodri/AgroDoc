/**
 * Documento: pruebas de PasswordInput y ConfirmDialog.
 * Verifican que la contraseña esté oculta por defecto y que las acciones
 * destructivas exijan confirmación explícita.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { light } from '@agrodoc/tokens';
import { PasswordInput } from '../src/molecules/PasswordInput/PasswordInput';
import { ConfirmDialog } from '../src/organisms/ConfirmDialog/ConfirmDialog';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('PasswordInput', () => {
    it('oculta la contraseña y la muestra al presionar el botón', async () => {
        const user = userEvent.setup();

        renderWithTheme(
            <PasswordInput
                label="Contraseña"
                value="AgroDoc123"
                onChangeText={() => {}}
            />
        );

        const input = screen.getByLabelText('Contraseña');
        expect(input).toHaveAttribute('type', 'password');

        await user.click(
            screen.getByRole('button', { name: 'Mostrar contraseña' })
        );

        expect(input.getAttribute('type')).not.toBe('password');
        expect(
            screen.getByRole('button', { name: 'Ocultar contraseña' })
        ).toBeInTheDocument();
    });
});

describe('ConfirmDialog', () => {
    it('no ejecuta la acción al cancelar', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onCancel = vi.fn();

        renderWithTheme(
            <ConfirmDialog
                visible
                title="Cerrar sesión"
                message="¿Seguro que quieres salir?"
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );

        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('confirma la eliminación con etiqueta destructiva', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();

        renderWithTheme(
            <ConfirmDialog
                visible
                title="Eliminar cultivo"
                message="Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                destructive
                onConfirm={onConfirm}
                onCancel={() => {}}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Eliminar' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });
});
