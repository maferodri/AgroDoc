/**
 * Documento: estilos del organismo ConfirmDialog.
 * Fondo semitransparente y tarjeta central con acciones alineadas.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, shadow, typography }) =>
    StyleSheet.create({
        backdrop: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.lg,
            backgroundColor: 'rgba(7, 59, 58, 0.45)',
        },
        card: {
            width: '100%',
            maxWidth: 420,
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.card,
            backgroundColor: colors.surface,
            boxShadow: `${shadow.modal.offsetX}px ${shadow.modal.offsetY}px ${shadow.modal.blur}px ${shadow.modal.spread}px ${shadow.modal.color}`,
        },
        title: {
            fontSize: typography.subtitle.fontSize,
            fontWeight: typography.fontWeight.bold,
            color: colors.text,
        },
        message: {
            fontSize: typography.body.fontSize,
            color: colors.notselected,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: spacing.sm,
            marginTop: spacing.sm,
        },
    });
