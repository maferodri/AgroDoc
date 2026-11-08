/**
 * Documento: estilos del átomo Divider.
 * Línea fina que toma el color de borde del tema y puede estirarse desde
 * el consumidor mediante la prop `style`.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors }) =>
    StyleSheet.create({
        line: {
            height: 1,
            backgroundColor: colors.border,
        },
    });
