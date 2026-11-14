/**
 * Documento: decoradores globales de Storybook.
 * Todos los componentes reciben el tema claro de AgroDoc.
 */
import React from 'react';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { light } from '@agrodoc/tokens';

export const decorators = [
    (Story) => (
        <ThemeProvider theme={light}>
            <Story />
        </ThemeProvider>
    ),
];
