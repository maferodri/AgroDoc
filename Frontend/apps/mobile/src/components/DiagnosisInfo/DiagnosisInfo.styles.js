/**
 * Documento: estilos del organismo de información del diagnóstico.
 * La foto ocupa la tarjeta y el degradado oscurece la zona del resultado.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing, radius, typography }) =>
    StyleSheet.create({
        container: {
            flex: 1,
            minHeight: 0,
            borderRadius: radius.card,
            overflow: 'hidden',
        },
        scrim: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '60%',
            borderTopLeftRadius: radius.card,
            borderTopRightRadius: radius.card,
        },
        overlay: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            gap: spacing.xs,
            padding: spacing.lg,
        },
        overline: {
            fontWeight: typography.fontWeight.bold,
        },
    });
