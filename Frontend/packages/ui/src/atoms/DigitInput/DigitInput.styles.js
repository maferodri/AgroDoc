/**
 * Documento: estilos del átomo DigitInput.
 * Caja blanca con borde redondeado que se resalta al enfocarse, usando los
 * mismos tokens que el resto de campos.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, typography }) =>
    StyleSheet.create({
        input: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.card,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xs,
            // En web hay que anular el outline nativo; el foco lo dibuja el borde.
            outlineStyle: 'none',
            color: colors.text,
            fontSize: typography.subtitle.fontSize,
            fontWeight: typography.subtitle.fontWeight,
        },
        focused: {
            borderColor: colors.primary,
        },
        disabled: {
            opacity: 0.5,
        },
    });
