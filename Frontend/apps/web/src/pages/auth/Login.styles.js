/**
 * Documento: estilos de la pantalla de inicio de sesión web.
 * Centra la tarjeta de LoginForm sobre el fondo fotográfico y define el ancho
 * máximo de lectura del formulario.
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
            maxWidth: 480,
        },
    });
