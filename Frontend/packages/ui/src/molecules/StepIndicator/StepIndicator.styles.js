/**
 * Documento: estilos de la molécula StepIndicator.
 * Distribuye las barras en partes iguales y separa cada paso con el
 * espaciado del tema.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing }, gap) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignSelf: 'stretch',
            gap: typeof gap === 'number' ? gap : spacing.sm,
        },
        segment: {
            flex: 1,
        },
    });
