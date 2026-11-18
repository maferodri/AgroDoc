/**
 * Documento: estilos de la vista previa de la foto.
 * Imagen recortada en una tarjeta que ocupa el alto disponible y distintivo
 * desbordando la esquina.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignSelf: 'stretch',
            minHeight: 0,
        },
        frame: {
            flex: 1,
            borderRadius: radius.card,
            overflow: 'hidden',
            backgroundColor: colors.track,
        },
        image: {
            width: '100%',
            height: '100%',
        },
        badge: {
            position: 'absolute',
            top: -spacing.sm,
            right: -spacing.sm,
        },
    });
