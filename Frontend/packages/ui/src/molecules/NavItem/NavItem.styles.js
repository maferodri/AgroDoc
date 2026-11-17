/**
 * Documento: estilos de la molécula NavItem.
 * La variante `web` muestra icono y texto en fila con píldora al seleccionar;
 * la variante `mobile` apila el texto debajo del icono.
 */
import { StyleSheet } from 'react-native';

export const NAV_ITEM_VARIANTS = ['web', 'mobile'];

export const getStyles = ({ colors, spacing, radius, typography }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'stretch',
            gap: spacing.sm,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.button,
        },
        containerMobile: {
            flexDirection: 'column',
            gap: spacing.xs,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.xs,
            borderRadius: radius.md,
        },
        selected: {
            backgroundColor: colors.primary,
        },
        pressed: {
            opacity: 0.85,
        },
        label: {
            fontSize: typography.button.fontSize,
            fontWeight: typography.button.fontWeight,
        },
        labelMobile: {
            fontSize: typography.caption.fontSize,
            fontWeight: typography.caption.fontWeight,
        },
    });
