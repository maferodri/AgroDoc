/**
 * Documento: estilos del distintivo de la vista previa.
 * Círculo dorado con la chispa en color primario.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, radius, size }) =>
    StyleSheet.create({
        container: {
            width: size.avatarMd,
            height: size.avatarMd,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.avatar,
            backgroundColor: colors.warning,
        },
    });
