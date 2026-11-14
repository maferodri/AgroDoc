/**
 * Documento: estilos de la pantalla de registro móvil.
 * Deja visible el fondo fotográfico arriba y superpone una hoja blanca con
 * esquinas redondeadas que contiene el formulario de creación de cuenta.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius }) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboard: {
            flex: 1,
        },
        scroll: {
            flexGrow: 1,
        },
        sheet: {
            flexGrow: 1,
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.xl,
            paddingHorizontal: spacing.screenPadding,
        },
    });
