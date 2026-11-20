/**
 * Documento: estilos de la molécula CodeInput.
 * Distribuye los dígitos en partes iguales y separa etiqueta, campos y ayuda
 * con el espaciado del tema.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing }) =>
    StyleSheet.create({
        container: {
            alignSelf: 'stretch',
            gap: spacing.xs,
        },
        row: {
            flexDirection: 'row',
            gap: spacing.xs,
        },
        digit: {
            flex: 1,
            // Sin minWidth el ancho intrínseco del input desborda en web.
            minWidth: 0,
        },
        digitError: {
            borderColor: colors.danger,
        },
    });
