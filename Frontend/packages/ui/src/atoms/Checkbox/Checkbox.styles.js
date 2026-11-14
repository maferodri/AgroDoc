/**
 * Documento: estilos y medidas del átomo Checkbox.
 * Deriva borde e icono a partir del lado recibido y usa tokens del tema.
 */
import { StyleSheet } from 'react-native';

/**
 * Calcula el grosor del borde y el tamaño del check de forma proporcional.
 * @param {number} size Lado del checkbox en px.
 */
export function getMetrics(size) {
    return {
        size,
        borderWidth: Math.max(1, Math.round(size * 0.083)),
        iconSize: Math.round(size * 0.72),
    };
}

export const getStyles = ({ colors, radius }) =>
    StyleSheet.create({
        box: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.notselected,
            borderRadius: radius.sm,
        },
        checked: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        pressed: {
            opacity: 0.8,
        },
        disabled: {
            opacity: 0.5,
        },
    });
