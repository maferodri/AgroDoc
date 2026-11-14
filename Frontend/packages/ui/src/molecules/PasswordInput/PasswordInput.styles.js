/**
 * Documento: estilos de la molécula PasswordInput.
 * Define el área táctil del botón que alterna la visibilidad.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing }) =>
    StyleSheet.create({
        toggle: {
            paddingHorizontal: spacing.xs,
            alignItems: 'center',
            justifyContent: 'center',
        },
        pressed: {
            opacity: 0.6,
        },
    });
