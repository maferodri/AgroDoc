/**
 * Documento: acción principal de la barra móvil (fotografía).
 * Solo se usa en la app móvil; por eso vive en la app y no en @agrodoc/ui.
 */
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Icon, useTheme } from '@agrodoc/ui';
import { getStyles } from './NavAction.styles';

/**
 * @param {string} [icon] Nombre del icono de la acción.
 * @param {string} [label] Etiqueta accesible de la acción.
 * @param {boolean} [disabled] Bloquea la interacción y lo atenúa.
 * @param {() => void} [onPress] Acción al pulsar el botón.
 */
export function NavAction({
    icon = 'camera',
    label = 'Fotografía',
    disabled = false,
    onPress,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <Pressable
            {...rest}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.container,
                disabled && styles.disabled,
                pressed && styles.pressed,
                style,
            ]}
        >
            <Icon
                name={icon}
                size={theme.typography.fontSize.xxl}
                color={
                    disabled
                        ? theme.colors.notselected
                        : theme.colors.textOnPrimary
                }
            />
        </Pressable>
    );
}
