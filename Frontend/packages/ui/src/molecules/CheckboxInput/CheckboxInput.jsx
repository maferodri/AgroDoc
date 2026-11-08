/**
 * Documento: molécula CheckboxInput.
 * Compone el átomo Checkbox con un texto descriptivo; toda la fila es
 * presionable para facilitar la selección en móvil y web.
 */
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './CheckboxInput.styles';

/**
 * @param {boolean} [checked] Indica si la opción está marcada.
 * @param {(checked: boolean) => void} [onChange] Recibe el siguiente valor al presionar.
 * @param {React.ReactNode} [label] Texto o contenido descriptivo de la opción.
 * @param {boolean} [disabled] Deshabilita la interacción.
 * @param {number} [size] Lado de la casilla en px.
 */
export function CheckboxInput({
    checked = false,
    onChange,
    label,
    disabled = false,
    size,
    style,
    accessibilityLabel,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <Pressable
            {...rest}
            onPress={() => onChange?.(!checked)}
            disabled={disabled}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled }}
            aria-checked={checked}
            accessibilityLabel={
                accessibilityLabel ??
                (typeof label === 'string' ? label : undefined)
            }
            style={({ pressed }) => [
                styles.row,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            {/* La casilla es solo visual: la fila completa maneja el estado. */}
            <Checkbox checked={checked} size={size} interactive={false} />
            <Text variant="body" color="notselected" style={styles.label}>
                {label}
            </Text>
        </Pressable>
    );
}
