/**
 * Documento: estilos y medidas del átomo Avatar.
 * Genera estilos desde tokens y medidas proporcionales al diámetro recibido.
 */
import { StyleSheet } from 'react-native';

/** Presets de tamaño que se resuelven contra `theme.size`. */
export const AVATAR_SIZE_TOKENS = {
    sm: 'avatarSm',
    md: 'avatarMd',
    lg: 'avatarLg',
    xl: 'avatarXl',
};

/**
 * Deriva grosores, badge y tipografía a partir del diámetro del avatar,
 * para que todo escale de forma paramétrica sin valores fijos por tamaño.
 * @param {number} size Diámetro total del avatar en px.
 */
export function getMetrics(size) {
    const badgeSize = Math.max(20, Math.round(size * 0.34));

    return {
        size,
        ringWidth: Math.max(2, Math.round(size * 0.045)),
        ringGap: Math.max(2, Math.round(size * 0.04)),
        badgeSize,
        badgeBorderWidth: Math.max(2, Math.round(size * 0.025)),
        badgeIconSize: Math.round(badgeSize * 0.5),
        initialsFontSize: Math.round(size * 0.36),
        fallbackIconSize: Math.round(size * 0.5),
    };
}

export const getStyles = ({ colors, radius, typography }) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: radius.avatar,
            backgroundColor: colors.background,
        },
        ring: {
            borderColor: colors.primary,
            backgroundColor: colors.surface,
        },
        inner: {
            flex: 1,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: radius.avatar,
            backgroundColor: colors.background,
        },
        image: {
            width: '100%',
            height: '100%',
        },
        initials: {
            color: colors.primary,
            fontWeight: typography.title.fontWeight,
        },
        badge: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.badge,
            backgroundColor: colors.primary,
            borderColor: colors.surface,
        },
        badgePressed: {
            opacity: 0.85,
        },
    });
