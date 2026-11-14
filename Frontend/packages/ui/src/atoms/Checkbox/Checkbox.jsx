/**
 * Documento: átomo Checkbox.
 * Casilla cuadrada controlada con estados marcado, deshabilitado y tamaño
 * paramétrico, accesible como rol `checkbox`.
 */
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../Icon/Icon';
import { useTheme } from '../../theme/useTheme';
import { getMetrics, getStyles } from './Checkbox.styles';

/**
 * @param {boolean} [checked] Indica si la casilla está marcada.
 * @param {() => void} [onPress] Callback al presionar la casilla.
 * @param {boolean} [disabled] Deshabilita la interacción.
 * @param {number} [size] Lado en px; por defecto `theme.size.checkbox`.
 * @param {boolean} [interactive] Si es `false`, solo dibuja la casilla para
 * que un contenedor (p. ej. CheckboxInput) maneje la interacción.
 */
export function Checkbox({
    checked = false,
    onPress,
    disabled = false,
    size,
    interactive = true,
    style,
    accessibilityLabel,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const resolvedSize = typeof size === 'number'
        ? size
        : theme.size?.checkbox ?? theme.typography.fontSize.xl;
    const metrics = useMemo(() => getMetrics(resolvedSize), [resolvedSize]);

    const boxStyle = [
        styles.box,
        {
            width: metrics.size,
            height: metrics.size,
            borderWidth: metrics.borderWidth,
        },
        checked && styles.checked,
        disabled && styles.disabled,
        style,
    ];

    const content = checked && (
        <Icon
            name="check"
            size={metrics.iconSize}
            color={theme.colors.textOnPrimary}
        />
    );

    // Modo presentacional: la fila contenedora expone el rol y el estado.
    if (!interactive) {
        return (
            <View style={boxStyle} accessible={false} aria-hidden>
                {content}
            </View>
        );
    }

    return (
        <Pressable
            {...rest}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled }}
            aria-checked={checked}
            accessibilityLabel={accessibilityLabel}
            hitSlop={theme.spacing.xs}
            style={({ pressed }) => [
                ...boxStyle,
                pressed && !disabled && styles.pressed,
            ]}
        >
            {content}
        </Pressable>
    );
}
