/**
 * Documento: estilos del átomo Badge.
 * Cada variante usa solo colores semánticos del tema.
 */
import { StyleSheet } from 'react-native';

export const BADGE_VARIANTS = ['healthy', 'warning', 'danger', 'premium'];

export const getStyles = ({ colors, spacing, radius, typography }) => {
    const base = StyleSheet.create({
        badge: {
            alignSelf: 'flex-start',
            paddingVertical: spacing.xs / 2,
            paddingHorizontal: spacing.sm,
            borderRadius: radius.badge,
        },
        label: {
            fontSize: typography.caption.fontSize,
            fontWeight: typography.fontWeight.bold,
        },
    });

    const variant = StyleSheet.create({
        healthy: {
            backgroundColor: colors.success,
            color: colors.textOnPrimary,
        },
        warning: {
            backgroundColor: colors.warning,
            color: colors.text,
        },
        danger: {
            backgroundColor: colors.danger,
            color: colors.textOnPrimary,
        },
        premium: {
            backgroundColor: colors.special,
            color: colors.textOnPrimary,
        },
    });

    return { ...base, variant };
};
