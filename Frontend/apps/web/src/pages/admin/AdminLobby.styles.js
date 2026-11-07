/**
 * Documento: estilos del panel de administración.
 * Define la tarjeta de cada usuario y el encabezado del dashboard.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, shadow, typography }) =>
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
            gap: spacing.lg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
            flexWrap: 'wrap',
        },
        headerText: {
            gap: spacing.xs,
        },
        section: {
            gap: spacing.md,
        },
        userCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
            flexWrap: 'wrap',
            padding: spacing.md,
            borderRadius: radius.card,
            backgroundColor: colors.surface,
            boxShadow: `${shadow.card.offsetX}px ${shadow.card.offsetY}px ${shadow.card.blur}px ${shadow.card.spread}px ${shadow.card.color}`,
        },
        userInfo: {
            flex: 1,
            minWidth: 220,
            gap: spacing.xs,
        },
        badges: {
            flexDirection: 'row',
            gap: spacing.xs,
            marginTop: spacing.xs,
        },
        footerHint: {
            fontSize: typography.caption.fontSize,
            color: colors.notselected,
        },
    });
