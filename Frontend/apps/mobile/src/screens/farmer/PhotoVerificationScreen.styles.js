/**
 * Documento: estilos de la pantalla de verificación de la foto.
 * Fondo blanco con el contenido ajustado entre el encabezado y la barra.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing }) =>
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
    });
