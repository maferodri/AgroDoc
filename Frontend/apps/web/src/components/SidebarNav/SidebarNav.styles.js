/**
 * Documento: estilos de la barra lateral web.
 * Marca, navegación principal y acciones de cuenta.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, size }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'space-between',
            gap: spacing.xl,
            padding: spacing.lg,
            backgroundColor: colors.surface,
        },
        top: {
            gap: spacing.xl,
        },
        brand: {
            gap: spacing.xs,
        },
        brandRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        logo: {
            width: size.avatarMd,
            height: size.avatarMd,
        },
        nav: {
            gap: spacing.xs,
        },
        footer: {
            gap: spacing.xs,
        },
    });
