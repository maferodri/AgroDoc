/**
 * Documento: estilos de la barra inferior móvil.
 * Acción circular flotante sobre el centro.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, size }) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.background,
            position: 'relative',
        },
        item: {
            flex: 1,
        },
        spacer: {
            flex: 1,
        },
        action: {
            position: 'absolute',
            top: -(size.avatarLg / 2),
            left: 0,
            right: 0,
            alignItems: 'center',
        },
    });
