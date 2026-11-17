/**
 * Documento: molécula NavItem.
 * Elemento de barra de navegación con icono y texto. La variante `web` coloca
 * el texto a la derecha del icono y pinta una píldora al estar seleccionado;
 * la variante `mobile` coloca el texto debajo y solo cambia de color.
 */
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Icon } from '../../atoms/Icon/Icon';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { NAV_ITEM_VARIANTS, getStyles } from './NavItem.styles';

/**
 * @param {keyof typeof import('../../atoms/Icon/icons').ICONS} icon Nombre del icono.
 * @param {string} label Texto visible del elemento.
 * @param {'web'|'mobile'} [variant] Distribución según la barra que lo contiene.
 * @param {boolean} [selected] Marca el elemento como activo.
 * @param {boolean} [disabled] Bloquea la interacción y lo atenúa.
 * @param {() => void} [onPress] Acción al pulsar el elemento.
 */
export function NavItem({
    icon,
    label,
    variant = 'web',
    selected = false,
    disabled = false,
    onPress,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const resolvedVariant = NAV_ITEM_VARIANTS.includes(variant) ? variant : 'web';
    const isMobile = resolvedVariant === 'mobile';
    const active = selected && !disabled;
    const color = disabled
        ? theme.colors.track
        : active
            ? isMobile
                ? theme.colors.primary
                : theme.colors.textOnPrimary
            : theme.colors.notselected;

    if (process.env.NODE_ENV !== 'production' && resolvedVariant !== variant) {
        console.warn(
            `NavItem: variante "${variant}" no existe. Usa: ${NAV_ITEM_VARIANTS.join(', ')}`
        );
    }

    return (
        <Pressable
            {...rest}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active, disabled }}
            aria-selected={active}
            style={({ pressed }) => [
                styles.container,
                isMobile && styles.containerMobile,
                !isMobile && active && styles.selected,
                pressed && styles.pressed,
                style,
            ]}
        >
            <Icon
                name={icon}
                size={theme.typography.fontSize.xl}
                color={color}
            />
            <Text
                variant="body"
                style={[
                    isMobile ? styles.labelMobile : styles.label,
                    { color },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}
