/**
 * Documento: pruebas de la molécula CodeInput.
 * Verifican el avance automático del foco al escribir, el retroceso con
 * Backspace, la cantidad paramétrica de dígitos y la cuenta de reenvío.
 */
import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { light } from '@agrodoc/tokens';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { CodeInput } from '../src/molecules/CodeInput/CodeInput';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

/** Envoltorio controlado para reproducir el uso real desde una pantalla. */
function ControlledCode({ length = 5 }) {
    const [value, setValue] = useState('');

    return (
        <CodeInput length={length} value={value} onChangeText={setValue} />
    );
}

describe('CodeInput', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('avanza el foco al siguiente dígito al escribir', async () => {
        const user = userEvent.setup();

        renderWithTheme(<ControlledCode />);

        const first = screen.getByLabelText('Dígito 1 de 5');
        await user.type(first, '1');

        expect(first).toHaveValue('1');
        expect(screen.getByLabelText('Dígito 2 de 5')).toHaveFocus();
    });

    it('retrocede con Backspace cuando el dígito actual está vacío', async () => {
        const user = userEvent.setup();

        renderWithTheme(<ControlledCode />);

        await user.type(screen.getByLabelText('Dígito 1 de 5'), '1');
        await user.keyboard('{Backspace}');

        expect(screen.getByLabelText('Dígito 1 de 5')).toHaveFocus();
    });

    it('renderiza la cantidad de dígitos indicada y solo acepta números', async () => {
        const user = userEvent.setup();

        renderWithTheme(<ControlledCode length={3} />);

        expect(screen.getAllByLabelText(/Dígito \d de 3/)).toHaveLength(3);

        const first = screen.getByLabelText('Dígito 1 de 3');
        await user.type(first, 'a');

        expect(first).toHaveValue('');
    });

    it('cuenta atrás y solo reenvía al llegar a cero', () => {
        vi.useFakeTimers();
        const onResend = vi.fn();

        renderWithTheme(
            <CodeInput
                length={6}
                resendSeconds={2}
                onResend={onResend}
            />
        );

        fireEvent.click(screen.getByText('Reenviar Código (0:01)'));
        expect(onResend).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        fireEvent.click(screen.getByText('Reenviar Código'));

        expect(onResend).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Reenviar Código (0:01)')).toBeInTheDocument();
    });
});
