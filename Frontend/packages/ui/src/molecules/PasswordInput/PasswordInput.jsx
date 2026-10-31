/**
 * Documento: molécula PasswordInput.
 * Especializa FormField con un Input seguro y un botón de ojo que alterna
 * la visibilidad de la contraseña (HU1.2), manteniendo el estado local.
 */
import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Icon } from '../../atoms/Icon/Icon';
import { useTheme } from '../../theme/useTheme';
import { FormField } from '../FormField/FormField';
import { getStyles } from './PasswordInput.styles';

/**
 * @param {string} [label] Etiqueta del campo (p. ej. "Contraseña").
 * @param {string} [value] Valor controlado de la contraseña.
 * @param {(text: string) => void} [onChangeText] Callback al escribir.
 * @param {string} [error] Mensaje de error validado por el feature.
 * @param {string} [helperText] Mensaje de ayuda.
 * @param {boolean} [required] Marca el campo como obligatorio.
 * @param {string} [placeholder] Texto de ejemplo dentro del campo.
 */
export function PasswordInput({
    label,
    value,
    onChangeText,
    error,
    helperText,
    required = false,
    placeholder,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [visible, setVisible] = useState(false);

    // El ojo solo cambia el estado local: la contraseña queda oculta por defecto.
    const toggleVisibility = () => setVisible((current) => !current);

    return (
        <FormField
            {...rest}
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            error={error}
            helperText={helperText}
            required={required}
            secureTextEntry={!visible}
            trailing={
                <Pressable
                    onPress={toggleVisibility}
                    accessibilityRole="button"
                    accessibilityLabel={
                        visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    hitSlop={theme.spacing.xs}
                    style={({ pressed }) => [
                        styles.toggle,
                        pressed && styles.pressed,
                    ]}
                >
                    <Icon
                        name={visible ? 'eyeOff' : 'eye'}
                        size={theme.typography.fontSize.lg}
                        color={theme.colors.notselected}
                    />
                </Pressable>
            }
        />
    );
}
