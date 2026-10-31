/**
 * Documento: estilos de la molécula CheckboxInput.
 * Alinea la casilla con la primera línea del texto y permite que este envuelva.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing }) =>
    StyleSheet.create({
        row: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            alignSelf: 'stretch',
            gap: spacing.sm,
            paddingVertical: spacing.xs,
        },
        label: {
            flex: 1,
        },
        pressed: {
            opacity: 0.75,
        },
        disabled: {
            opacity: 0.5,
        },
    });
