/**
 * Documento: estilos de la molécula OrDivider.
 * Distribuye dos divisores a los lados de una etiqueta centrada.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'stretch',
        },
        line: {
            flex: 1,
        },
        label: {
            paddingHorizontal: spacing.md,
        },
    });
