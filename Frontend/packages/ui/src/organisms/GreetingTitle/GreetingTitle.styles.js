/**
 * Documento: estilos del organismo GreetingTitle.
 * Saludo discreto y nombre del agricultor como texto protagonista.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ spacing, typography }) =>
    StyleSheet.create({
        container: {
            alignSelf: 'stretch',
            gap: spacing.xs,
        },
        greeting: {
            fontWeight: typography.fontWeight.regular,
        },
        name: {
            fontSize: typography.fontSize.xxxxl,
            fontWeight: typography.fontWeight.regular,
            lineHeight: Math.round(
                typography.fontSize.xxxxl * typography.lineHeight.tight
            ),
        },
    });
