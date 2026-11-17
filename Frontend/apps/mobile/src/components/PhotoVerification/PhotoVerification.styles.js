/**
 * Documento: estilos del organismo de verificación de la foto.
 * Columna con el encabezado, la foto, las acciones y el consejo.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, typography }) =>
    StyleSheet.create({
        container: {
            gap: spacing.lg,
        },
        header: {
            gap: spacing.xs,
        },
        title: {
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.regular,
            lineHeight: Math.round(
                typography.fontSize.xl * typography.lineHeight.tight
            ),
        },
        actions: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        tip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.card,
            backgroundColor: colors.background,
        },
        tipContent: {
            flex: 1,
            gap: spacing.xs / 2,
        },
        tipTitle: {
            fontWeight: typography.fontWeight.bold,
        },
    });
