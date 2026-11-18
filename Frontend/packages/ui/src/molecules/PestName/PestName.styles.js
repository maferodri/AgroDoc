/**
 * Documento: estilos de la molécula PestName.
 * Etiqueta dorada y nombre en blanco para leer sobre una foto oscurecida.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ typography, spacing }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            gap: spacing.xs / 2,
        },
        label: {
            fontSize: typography.caption.fontSize,
            fontWeight: typography.fontWeight.medium,
        },
        name: {
            fontSize: typography.subtitle.fontSize,
            fontWeight: typography.fontWeight.bold,
        },
    });
