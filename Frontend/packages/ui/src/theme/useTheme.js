import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useTheme() {
    const theme = useContext(ThemeContext);
    if (!theme) {
        throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
    }
    return theme;
}