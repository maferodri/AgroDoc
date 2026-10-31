/**
 * Documento: molécula FormField.
 * Compone etiqueta, Input y mensaje de error o ayuda para estandarizar
 * los campos de formulario en todas las pantallas.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Input } from '../../atoms/Input/Input';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './FormField.styles';

/**
 * Los mensajes de error llegan ya validados por los esquemas Zod del feature;
 * este componente solo decide el color y la posición del mensaje.
 *
 * @param {string} [label] Etiqueta visible sobre el campo.
 * @param {string} [value] Valor controlado del campo.
 * @param {(text: string) => void} [onChangeText] Callback al escribir.
 * @param {string} [error] Mensaje de error; activa el borde `danger`.
 * @param {string} [helperText] Mensaje de ayuda cuando no hay error.
 * @param {boolean} [required] Marca el campo como obligatorio.
 * @param {string} [placeholder] Texto de ejemplo dentro del campo.
 */
export function FormField({
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
    const hasError = Boolean(error);
    const message = error || helperText;

    return (
        <View style={styles.container}>
            {label != null && (
                <View style={styles.labelRow}>
                    <Text variant="label" color="text">{label}</Text>
                    {required && (
                        <Text variant="label" color="danger"> *</Text>
                    )}
                </View>
            )}

            <Input
                {...rest}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                status={hasError ? 'error' : 'default'}
                accessibilityLabel={rest.accessibilityLabel ?? label ?? placeholder}
            />

            {message ? (
                <Text
                    variant="caption"
                    color={hasError ? 'danger' : 'notselected'}
                    accessibilityLiveRegion="polite"
                >
                    {message}
                </Text>
            ) : null}
        </View>
    );
}
