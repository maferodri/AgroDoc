/**
 * Documento: estilos del organismo RegisterForm.
 * Define la tarjeta web, la fila de contraseñas y la distribución vertical
 * del formulario de creación de cuenta.
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
        headerMobile: {
            marginTop: spacing.md,
            marginBottom: spacing.xxl,
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
        passwordRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.md,
        },
        passwordStack: {
            gap: spacing.inputGap,
        },
        passwordField: {
            flex: 1,
            // Sin minWidth el contenido impide que la columna encoja en web.
            minWidth: 0,
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
        login: {
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.md,
        },
        footer: {
            marginTop: spacing.xl,
            textAlign: 'center',
        },
    });
};
