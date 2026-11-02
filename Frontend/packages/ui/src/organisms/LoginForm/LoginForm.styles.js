/**
 * Documento: estilos del organismo LoginForm.
 * Define la tarjeta de la variante web y la distribución vertical de las
 * moléculas que forman el formulario de inicio de sesión.
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
        form: {
            gap: spacing.inputGap,
        },
        submit: {
            marginTop: spacing.sm,
        },
        formError: {
            marginTop: spacing.sm,
            textAlign: 'center',
        },
        divider: {
            marginVertical: spacing.lg,
        },
        register: {
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.md,
        },
        footer: {
            marginTop: spacing.xl,
            textAlign: 'center',
        },
        labelAccessory: {
            flexShrink: 1,
        },
    });
};
