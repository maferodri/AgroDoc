/**
 * Documento: pruebas del organismo PasswordResetForm.
 * Verifican que la variante web muestre el paso y la marca, y que la variante
 * móvil conserve su título y el enlace a inicio de sesión.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { light } from '@agrodoc/tokens';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { PasswordResetForm } from '../src/organisms/PasswordResetForm/PasswordResetForm';
import { PasswordResetConfirmForm } from '../src/organisms/PasswordResetConfirmForm/PasswordResetConfirmForm';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('PasswordResetForm', () => {
    it('muestra paso, marca y aviso en web y envía el formulario', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        renderWithTheme(
            <PasswordResetForm
                variant="web"
                email="agricultor@agro.com"
                onSubmit={onSubmit}
            />
        );

        expect(screen.getByText('Paso 1/2')).toBeInTheDocument();
        expect(screen.getByText('AgroDoc')).toBeInTheDocument();
        expect(
            screen.getByText(/contacta con el administrador/)
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Enviar Código' })
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('en móvil usa su título y enlaza al inicio de sesión', async () => {
        const user = userEvent.setup();
        const onLogin = vi.fn();

        renderWithTheme(<PasswordResetForm onLogin={onLogin} />);

        expect(screen.getByText('Restablecer Contraseña')).toBeInTheDocument();
        expect(screen.queryByText('Paso 1/2')).not.toBeInTheDocument();

        await user.click(
            screen.getByRole('link', { name: 'Iniciar Sesión' })
        );

        expect(onLogin).toHaveBeenCalledTimes(1);
    });

    it('oculta el aviso cuando `hint` es null', () => {
        renderWithTheme(<PasswordResetForm hint={null} />);

        expect(
            screen.queryByText(/contacta con el administrador/)
        ).not.toBeInTheDocument();
    });
});

describe('PasswordResetConfirmForm', () => {
    it('muestra el paso 2, el código y las contraseñas, y dispara las acciones', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        const onCancel = vi.fn();

        renderWithTheme(
            <PasswordResetConfirmForm
                variant="web"
                onSubmit={onSubmit}
                onCancel={onCancel}
            />
        );

        expect(screen.getByText('Paso 2/2')).toBeInTheDocument();
        expect(screen.getByText('Código de Verificación')).toBeInTheDocument();
        expect(screen.getByLabelText('Nueva Contraseña')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Confirmar Contraseña')
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', { name: 'Restablecer' })
        );
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
