/**
 * Documento: estilos de la molécula Callout.
 * Caja gris redondeada con el espaciado del tema, sin borde ni icono.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius }) =>
    StyleSheet.create({
        container: {
            alignSelf: 'stretch',
            backgroundColor: colors.background,
            borderRadius: radius.card,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
        },
    });
