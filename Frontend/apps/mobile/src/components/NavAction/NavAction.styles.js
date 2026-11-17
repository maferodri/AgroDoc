/**
 * Documento: estilos del botón circular de la barra móvil.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, radius, size }) =>
    StyleSheet.create({
        container: {
            width: size.avatarLg,
            height: size.avatarLg,
            borderRadius: radius.avatar,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        disabled: {
            backgroundColor: colors.track,
        },
        pressed: {
            opacity: 0.85,
        },
    });
