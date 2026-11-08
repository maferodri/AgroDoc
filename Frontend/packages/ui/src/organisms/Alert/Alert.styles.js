/**
 * Documento: estilos del organismo Alert.
 * Cada variante combina un icono y un color semántico del tema.
 */
import { StyleSheet } from 'react-native';

export const ALERT_VARIANTS = ['info', 'weather', 'critical'];

export const getStyles = ({ colors, spacing, radius, typography }) => {
    const base = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.card,
            borderWidth: 1,
        },
        content: {
            flex: 1,
            gap: spacing.xs,
        },
        title: {
            fontSize: typography.label.fontSize,
            fontWeight: typography.fontWeight.bold,
        },
        message: {
            fontSize: typography.caption.fontSize,
            color: colors.text,
        },
    });

    const variant = StyleSheet.create({
        info: {
            backgroundColor: colors.background,
            borderColor: colors.primary,
            color: colors.primary,
        },
        weather: {
            backgroundColor: colors.background,
            borderColor: colors.warning,
            color: colors.warning,
        },
        critical: {
            backgroundColor: colors.background,
            borderColor: colors.danger,
            color: colors.danger,
        },
    });

    return { ...base, variant };
};

/** Icono asociado a cada variante de alerta. */
export const ALERT_ICONS = {
    info: 'info',
    weather: 'cloud',
    critical: 'bell',
};
