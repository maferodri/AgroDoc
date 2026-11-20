/**
 * Documento: átomo DigitInput.
 * Campo de un solo carácter para códigos de verificación (OTP). Acepta solo
 * números, centra el texto y expone su ref para que la molécula controle el foco.
 */
import { forwardRef, useMemo, useState } from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './DigitInput.styles';

/**
 * @param {string} [value] Dígito controlado.
 * @param {(text: string) => void} [onChangeText] Callback al escribir.
 * @param {string} [placeholder] Carácter mostrado mientras está vacío.
 * @param {boolean} [disabled] Deshabilita la edición.
 */
export const DigitInput = forwardRef(function DigitInput(
    {
        value,
        onChangeText,
        placeholder = '-',
        disabled = false,
        style,
        accessibilityLabel,
        onFocus,
        onBlur,
        ...rest
    },
    ref
) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [focused, setFocused] = useState(false);

    return (
        <TextInput
            {...rest}
            ref={ref}
            style={[
                styles.input,
                focused && styles.focused,
                disabled && styles.disabled,
                style,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.notselected}
            maxLength={1}
            keyboardType="number-pad"
            textAlign="center"
            editable={!disabled}
            selectionColor={theme.colors.primary}
            underlineColorAndroid="transparent"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled }}
            onFocus={(event) => {
                setFocused(true);
                onFocus?.(event);
            }}
            onBlur={(event) => {
                setFocused(false);
                onBlur?.(event);
            }}
        />
    );
});
