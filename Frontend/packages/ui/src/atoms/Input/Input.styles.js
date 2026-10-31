/**
 * Documento: estilos del átomo Input.
 * Define contenedor, foco, deshabilitado y tipografía desde tokens.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, typography }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'stretch',
            gap: spacing.xs,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.input,
            paddingVertical: spacing.buttonY,
            paddingHorizontal: spacing.buttonX,
        },
        focused: {
            borderColor: colors.primary,
        },
        error: {
            borderColor: colors.danger,
        },
        disabled: {
            opacity: 0.5,
        },
        symbol: {
            color: colors.notselected,
            fontSize: typography.body.fontSize,
            fontWeight: typography.body.fontWeight,
        },
        input: {
            flex: 1,
            padding: 0,
            outlineWidth: 0,
            color: colors.text,
            fontSize: typography.body.fontSize,
            fontWeight: typography.body.fontWeight,
        },
    });
