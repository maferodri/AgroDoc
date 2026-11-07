/**
 * Documento: estilos de la bandeja del agrónomo.
 * Tarjetas horizontales con foto y resultado del diagnóstico.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, shadow }) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            minHeight: '100vh',
            backgroundColor: colors.background,
        },
        content: {
            width: '100%',
            maxWidth: 960,
            alignSelf: 'center',
            padding: spacing.lg,
            gap: spacing.md,
        },
        card: {
            flexDirection: 'row',
            gap: spacing.md,
            flexWrap: 'wrap',
            padding: spacing.md,
            borderRadius: radius.card,
            backgroundColor: colors.surface,
            boxShadow: `${shadow.card.offsetX}px ${shadow.card.offsetY}px ${shadow.card.blur}px ${shadow.card.spread}px ${shadow.card.color}`,
        },
        image: {
            width: 140,
            height: 110,
            borderRadius: radius.md,
            backgroundColor: colors.track,
        },
        body: {
            flex: 1,
            minWidth: 220,
            gap: spacing.xs,
        },
    });
