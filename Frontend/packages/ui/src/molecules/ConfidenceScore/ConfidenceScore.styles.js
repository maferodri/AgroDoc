/**
 * Documento: estilos de la molécula ConfidenceScore.
 * Etiqueta y porcentaje en blanco para leer sobre una foto oscurecida.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ typography, spacing }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: spacing.xs,
        },
        label: {
            fontSize: typography.caption.fontSize,
        },
        value: {
            fontSize: typography.subtitle.fontSize,
            fontWeight: typography.fontWeight.bold,
        },
    });
