/**
 * Documento: estilos de la barra superior móvil.
 * Título centrado entre dos zonas de acciones de igual ancho.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, size, typography }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.surface,
        },
        transparent: {
            backgroundColor: 'transparent',
        },
        side: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        sideLeft: {
            justifyContent: 'flex-start',
        },
        sideRight: {
            justifyContent: 'flex-end',
        },
        title: {
            paddingHorizontal: spacing.sm,
        },
        transparentTitle: {
            fontWeight: typography.fontWeight.regular,
        },
        button: {
            width: size.avatarSm,
            height: size.avatarSm,
            alignItems: 'center',
            justifyContent: 'center',
        },
        pressed: {
            opacity: 0.85,
        },
    });
