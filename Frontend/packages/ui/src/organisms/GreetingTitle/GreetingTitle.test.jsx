/**
 * Documento: pruebas del organismo GreetingTitle.
 * Confirma que el saludo y el nombre llegan por props.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { light } from '@agrodoc/tokens';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { GreetingTitle } from './GreetingTitle';

describe('GreetingTitle', () => {
    it('muestra el saludo y el nombre indicados', () => {
        render(
            <ThemeProvider theme={light}>
                <GreetingTitle greeting="Buenos Días" name="Carlos Estévez" />
            </ThemeProvider>
        );

        expect(screen.getByText('Buenos Días')).toBeInTheDocument();
        expect(screen.getByText('Carlos Estévez')).toBeInTheDocument();
    });
});
