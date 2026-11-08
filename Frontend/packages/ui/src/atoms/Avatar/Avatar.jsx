/**
 * Documento: átomo Avatar.
 * Imagen circular con variantes, tamaño paramétrico, badge de edición
 * y fallback automático cuando no hay imagen.
 */
import { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../Icon/Icon';
import { AVATAR_SIZE_TOKENS, getMetrics, getStyles } from './Avatar.styles';

/**
 * Acepta una URL o un objeto de imagen de React Native.
 * @param {object|string} source Imagen recibida por props.
 */
function normalizeSource(source) {
    if (!source) return null;
    return typeof source === 'string' ? { uri: source } : source;
}

/**
 * Construye hasta dos iniciales a partir del nombre para el fallback.
 * @param {string} [name] Nombre completo de la persona.
 */
function getInitials(name) {
    if (!name) return '';

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
}

/**
 * @param {object|string} [source] Imagen del avatar (`{ uri }` o URL).
 * @param {string} [name] Nombre usado para las iniciales del fallback.
 * @param {number|'sm'|'md'|'lg'|'xl'} [size] Diámetro total en px o preset del tema.
 * @param {'plain'|'ring'} [variant] `ring` agrega anillo verde con separación del fondo.
 * @param {boolean|React.ReactNode} [badge] `true` muestra el badge de cámara; también acepta un nodo.
 * @param {string} [badgeIcon] Icono del badge cuando `badge` es `true`.
 * @param {() => void} [onBadgePress] Hace interactivo el badge de edición.
 * @param {() => void} [onPress] Hace interactivo todo el avatar.
 * @param {React.ReactNode} [fallback] Contenido propio cuando no hay imagen.
 */
export function Avatar({
    source,
    name,
    size = 'md',
    variant = 'plain', // plain | ring
    badge = false,
    badgeIcon = 'camera',
    onBadgePress,
    onPress,
    fallback,
    style,
    imageStyle,
    accessibilityLabel,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    // Resuelve presets contra el tema y deja pasar cualquier diámetro numérico.
    const resolvedSize = typeof size === 'number'
        ? size
        : theme.size?.[AVATAR_SIZE_TOKENS[size]] ?? theme.size?.avatarMd;
    const metrics = useMemo(() => getMetrics(resolvedSize), [resolvedSize]);

    const normalizedSource = normalizeSource(source);
    const initials = getInitials(name);
    const isRing = variant === 'ring';

    // Fallback: nodo propio, iniciales del nombre o icono genérico de persona.
    const fallbackContent = fallback ?? (
        initials ? (
            <Text style={[styles.initials, { fontSize: metrics.initialsFontSize }]}>
                {initials}
            </Text>
        ) : (
            <Icon
                name="person"
                size={metrics.fallbackIconSize}
                color={theme.colors.notselected}
            />
        )
    );

    const badgeStyle = [
        styles.badge,
        {
            width: metrics.badgeSize,
            height: metrics.badgeSize,
            borderWidth: metrics.badgeBorderWidth,
        },
    ];
    const badgeContent = badge === true
        ? (
            <Icon
                name={badgeIcon}
                size={metrics.badgeIconSize}
                color={theme.colors.textOnPrimary}
            />
        )
        : badge;

    const content = normalizedSource ? (
        <Image
            source={normalizedSource}
            style={[styles.image, imageStyle]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
        />
    ) : (
        fallbackContent
    );

    return (
        <View
            {...rest}
            style={[
                styles.container,
                { width: metrics.size, height: metrics.size },
                isRing && styles.ring,
                isRing && {
                    borderWidth: metrics.ringWidth,
                    padding: metrics.ringGap,
                },
                style,
            ]}
        >
            <Pressable
                onPress={onPress}
                disabled={!onPress}
                accessibilityRole={onPress ? 'button' : 'image'}
                accessibilityLabel={accessibilityLabel ?? name ?? 'Avatar'}
                style={styles.inner}
            >
                {content}
            </Pressable>

            {badge ? (
                onBadgePress ? (
                    <Pressable
                        onPress={onBadgePress}
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar foto"
                        hitSlop={Math.round(metrics.badgeSize * 0.2)}
                        style={({ pressed }) => [
                            badgeStyle,
                            pressed && styles.badgePressed,
                        ]}
                    >
                        {badgeContent}
                    </Pressable>
                ) : (
                    <View style={badgeStyle}>{badgeContent}</View>
                )
            ) : null}
        </View>
    );
}
