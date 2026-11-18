/**
 * Documento: estilos del resultado del diagnóstico.
 * Fondo blanco con el contenido ajustado entre el encabezado y la barra.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, typography }) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        content: {
            flex: 1,
            gap: spacing.lg,
            padding: spacing.lg,
            paddingBottom: spacing.xl,
        },
        heading: {
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.regular,
            lineHeight: Math.round(
                typography.fontSize.xl * typography.lineHeight.tight
            ),
        },
    });
