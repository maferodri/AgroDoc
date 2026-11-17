/**
 * Documento: estilos de la pantalla de verificación de la foto.
 * Fondo blanco con contenido desplazable entre el encabezado y la barra.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing }) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        scroll: {
            flex: 1,
        },
        content: {
            flexGrow: 1,
            gap: spacing.lg,
            padding: spacing.lg,
            paddingBottom: spacing.xl,
        },
    });
