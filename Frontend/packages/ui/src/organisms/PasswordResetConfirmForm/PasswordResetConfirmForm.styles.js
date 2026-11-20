/**
 * Documento: estilos del organismo PasswordResetConfirmForm.
 * Reutiliza la tarjeta y la cabecera de PasswordResetForm y añade el bloque
 * de código, el separador y los botones de acción.
 */
import { Platform, StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, shadow, size }) => {
    // La sombra solo aplica en web; las apps nativas usan la variante móvil.
    const cardShadow = Platform.OS === 'web'
        ? {
            boxShadow: `${shadow.card.offsetX}px ${shadow.card.offsetY}px ${shadow.card.blur}px ${shadow.card.spread}px ${shadow.card.color}`,
        }
        : {};

    return StyleSheet.create({
        container: {
            alignSelf: 'stretch',
            width: '100%',
        },
        card: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.card,
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.lg,
            ...cardShadow,
        },
        titleMobile: {
            marginBottom: spacing.lg,
        },
        progress: {
            gap: spacing.xs,
            marginBottom: spacing.lg,
        },
        progressMobile: {
            marginBottom: spacing.xl,
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.xl,
        },
        logo: {
            width: size.avatarLg,
            height: size.avatarLg,
        },
        subtitle: {
            marginTop: spacing.xs,
            textAlign: 'center',
        },
        description: {
            marginBottom: spacing.xl,
        },
        form: {
            gap: spacing.inputGap,
        },
        divider: {
            marginVertical: spacing.sm,
        },
        actions: {
            gap: spacing.sm,
            marginTop: spacing.sm,
        },
    });
};
