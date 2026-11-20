/**
 * Documento: estilos de la pantalla de recuperación de contraseña web.
 * Centra la tarjeta de PasswordResetForm sobre el fondo de registro.
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
