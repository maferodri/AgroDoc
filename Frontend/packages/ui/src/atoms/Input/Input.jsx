/**
 * Documento: átomo Input.
 * Campo de texto con placeholder, símbolo opcional, foco y estado deshabilitado.
 */
import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './Input.styles';

/**
 * @param {string} [placeholder] Texto de ejemplo del campo.
 * @param {string | React.ReactNode} [symbol] Símbolo opcional a la izquierda.
 * @param {React.ReactNode} [trailing] Acción o icono opcional a la derecha (p. ej. ojo de contraseña).
 * @param {'default'|'error'} [status] Estado visual del borde; `error` usa `colors.danger`.
 */
export function Input({
    placeholder,
    symbol,
    trailing,
    status = 'default',
    value,
    onChangeText,
    disabled = false,
    onFocus,
    onBlur,
    style,
    accessibilityLabel,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [focused, setFocused] = useState(false);

    return (
        <View
            style={[
                styles.container,
                focused && styles.focused,
                status === 'error' && styles.error,
                disabled && styles.disabled,
            ]}
        >
            {symbol != null && (
                React.isValidElement(symbol)
                    ? symbol
                    : <Text style={styles.symbol} accessible={false}>{symbol}</Text>
            )}
            <TextInput
                {...rest}
                style={[styles.input, style]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.notselected}
                editable={!disabled}
                selectionColor={theme.colors.primary}
                underlineColorAndroid="transparent"
                accessibilityLabel={accessibilityLabel ?? placeholder}
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
            {trailing != null && (
                React.isValidElement(trailing)
                    ? trailing
                    : <Text style={styles.symbol} accessible={false}>{trailing}</Text>
            )}
        </View>
    );
}
