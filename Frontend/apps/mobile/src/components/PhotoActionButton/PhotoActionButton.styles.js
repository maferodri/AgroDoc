/**
 * Documento: estilos del botón de acción de la vista previa.
 * Píldora delineada en color primario con icono y texto centrados.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, typography }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.button,
            borderWidth: 1.5,
            borderColor: colors.primary,
            backgroundColor: colors.surface,
        },
        label: {
            fontWeight: typography.label.fontWeight,
        },
        pressed: {
            opacity: 0.85,
        },
        disabled: {
            opacity: 0.5,
        },
    });
