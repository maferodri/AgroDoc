/**
 * Documento: estilos del átomo DynamicBar.
 * Usa el gris de pista, el verde primario y un radio circular fijo para que
 * todas las barras mantengan la misma forma.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, size, radius }) =>
    StyleSheet.create({
        track: {
            width: '100%',
            height: size.dynamicBar,
            backgroundColor: colors.track,
            borderRadius: radius.dynamicBar,
            overflow: 'hidden',
        },
        fill: {
            height: '100%',
            backgroundColor: colors.primary,
        },
    });
