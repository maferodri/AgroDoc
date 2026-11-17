/**
 * Documento: barra superior de la app móvil.
 * Muestra un título central y acciones a los lados (perfil, notificaciones,
 * regreso). Solo se usa en móvil; por eso vive en la app y no en @agrodoc/ui.
 * El título, los iconos y las acciones llegan por props según el contexto.
 */
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, Text, useTheme } from '@agrodoc/ui';
import { getStyles } from './TopBar.styles';

/**
 * Botón de icono de la barra. Se mantiene interno porque solo lo usa TopBar.
 *
 * @param {{icon: string, label: string, onPress?: () => void, disabled?: boolean}} action
 * @param {string} color Color del icono cuando la acción está habilitada.
 * @param {object} styles Estilos resueltos del tema.
 * @param {object} theme Tema activo.
 */
function TopBarAction({ action, color, styles, theme }) {
    const { icon, label, onPress, disabled = false } = action;

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
            <Icon
                name={icon}
                size={theme.typography.fontSize.xxxl}
                color={disabled ? theme.colors.notselected : color}
            />
        </Pressable>
    );
}

/**
 * @param {string} title Texto central de la barra.
 * @param {'solid'|'transparent'} [variant] Fondo sólido o transparente sobre la cámara.
 * @param {{icon: string, label: string, onPress?: () => void, disabled?: boolean}} [leftAction] Acción izquierda (perfil o regreso).
 * @param {Array<{icon: string, label: string, onPress?: () => void, disabled?: boolean}>} [rightActions] Acciones derechas (notificaciones, etc.).
 */
export function TopBar({
    title,
    variant = 'solid',
    leftAction,
    rightActions = [],
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isTransparent = variant === 'transparent';
    const iconColor = isTransparent
        ? theme.colors.textOnPrimary
        : theme.colors.primary;

    return (
        <View
            {...rest}
            style={[styles.container, isTransparent && styles.transparent, style]}
        >
            <View style={[styles.side, styles.sideLeft]}>
                {leftAction ? (
                    <TopBarAction
                        action={leftAction}
                        color={iconColor}
                        styles={styles}
                        theme={theme}
                    />
                ) : null}
            </View>

            <Text
                variant="title"
                color={isTransparent ? 'textOnPrimary' : 'primary'}
                align="center"
                numberOfLines={1}
                style={[styles.title, isTransparent && styles.transparentTitle]}
            >
                {title}
            </Text>

            <View style={[styles.side, styles.sideRight]}>
                {rightActions.map((action) => (
                    <TopBarAction
                        key={action.label}
                        action={action}
                        color={iconColor}
                        styles={styles}
                        theme={theme}
                    />
                ))}
            </View>
        </View>
    );
}
