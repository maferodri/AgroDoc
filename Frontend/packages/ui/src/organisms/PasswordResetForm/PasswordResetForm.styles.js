/**
 * Documento: estilos del organismo PasswordResetForm.
 * Define la tarjeta web, la barra de pasos y la distribución vertical del
 * formulario de recuperación de contraseña.
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
        formError: {
            textAlign: 'center',
        },
        submit: {
            marginTop: spacing.sm,
        },
        login: {
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.xxl,
        },
    });
};
