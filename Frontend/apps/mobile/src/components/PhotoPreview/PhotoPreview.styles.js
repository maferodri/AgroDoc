/**
 * Documento: estilos de la vista previa de la foto.
 * Imagen recortada en una tarjeta y distintivo desbordando la esquina.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius }) =>
    StyleSheet.create({
        container: {
            alignSelf: 'stretch',
        },
        frame: {
            aspectRatio: 0.87,
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
