/**
 * Documento: estilos de la molécula ConfidenceBar.
 * El color del relleno se resuelve por nivel de confianza.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, typography }) =>
    StyleSheet.create({
        container: {
            gap: spacing.xs,
            alignSelf: 'stretch',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        label: {
            fontSize: typography.label.fontSize,
            fontWeight: typography.label.fontWeight,
            color: colors.text,
        },
        value: {
            fontSize: typography.subtitle.fontSize,
            fontWeight: typography.fontWeight.bold,
        },
        hint: {
            fontSize: typography.caption.fontSize,
            color: colors.notselected,
        },
        colors: {
            high: colors.success,
            medium: colors.warning,
            low: colors.danger,
        },
    });
