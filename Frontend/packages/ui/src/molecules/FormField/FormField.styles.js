/**
 * Documento: estilos de la molécula FormField.
 * Organiza etiqueta, campo y mensaje con el espaciado del tema.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing }) =>
    StyleSheet.create({
        container: {
            alignSelf: 'stretch',
            gap: spacing.xs,
        },
        labelRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
    });
