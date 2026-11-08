/**
 * Documento: estilos de la pantalla de registro web.
 * Centra la tarjeta de RegisterForm sobre el fondo fotográfico y deja el
 * ancho necesario para mostrar las contraseñas en dos columnas.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing }) =>
    StyleSheet.create({
        root: {
            flex: 1,
            minHeight: '100vh',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.xxl,
            paddingHorizontal: spacing.screenPadding,
        },
        background: {
            ...StyleSheet.absoluteFillObject,
        },
        content: {
            width: '100%',
            maxWidth: 620,
        },
    });
