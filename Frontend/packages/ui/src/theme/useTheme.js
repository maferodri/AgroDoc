/**
 * Documento: hook de acceso al tema.
 * Devuelve el tema del contexto y falla si falta el ThemeProvider.
 */
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useTheme() {
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
    }
    return theme;
}