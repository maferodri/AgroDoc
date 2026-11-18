/**
 * Documento: estilos del modal del estado del análisis.
 * Tarjeta blanca centrada con el círculo de estado y la acción final.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, shadow, size }) =>
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
            alignItems: 'center',
            gap: spacing.lg,
            padding: spacing.xl,
            borderRadius: radius.card,
            backgroundColor: colors.surface,
            boxShadow: `${shadow.modal.offsetX}px ${shadow.modal.offsetY}px ${shadow.modal.blur}px ${shadow.modal.spread}px ${shadow.modal.color}`,
        },
        badge: {
            width: size.avatarXl,
            height: size.avatarXl,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.avatar,
            backgroundColor: colors.primary,
        },
    });
