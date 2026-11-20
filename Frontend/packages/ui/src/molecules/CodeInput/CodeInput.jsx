/**
 * Documento: molécula CodeInput.
 * Código de verificación compuesto por N átomos DigitInput. Al escribir un
 * dígito el foco avanza al siguiente campo; con Backspace en un campo vacío
 * retrocede. La cantidad de dígitos es paramétrica.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { DigitInput } from '../../atoms/DigitInput/DigitInput';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './CodeInput.styles';

/**
 * @param {number} [length] Cantidad de dígitos del código (6 por defecto, igual que el backend).
 * @param {string} [value] Código completo controlado (solo dígitos).
 * @param {(code: string) => void} [onChangeText] Callback con el código actualizado.
 * @param {string} [label] Etiqueta sobre los campos.
 * @param {string} [error] Mensaje de error validado.
 * @param {string} [resendLabel] Texto base del enlace para reenviar el código.
 * @param {number} [resendSeconds] Segundos de espera antes de habilitar el reenvío.
 * @param {() => void} [onResend] Acción de reenvío al terminar la cuenta.
 * @param {boolean} [autoFocus] Enfoca el primer dígito al montar.
 */
export function CodeInput({
    length = 6,
    value = '',
    onChangeText,
    label = 'Código de Verificación',
    error,
    resendLabel = 'Reenviar Código',
    resendSeconds = 60,
    onResend,
    autoFocus = false,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const inputs = useRef([]);
    // Arranca en 0:59 para coincidir con el diseño (el primer segundo ya corre).
    const initialSeconds = resendSeconds > 0 ? resendSeconds - 1 : 0;
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

    // Cuenta regresiva de un segundo; se detiene en 0 y habilita el reenvío.
    useEffect(() => {
        if (secondsLeft <= 0) return undefined;

        const timer = setTimeout(
            () => setSecondsLeft((current) => Math.max(0, current - 1)),
            1000
        );

        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const digits = String(value)
        .replace(/\D/g, '')
        .slice(0, length)
        .split('');

    const focusAt = (index) => {
        if (index >= 0 && index < length) {
            inputs.current[index]?.focus();
        }
    };

    // Escribe el dígito en su posición y avanza el foco cuando hay valor.
    const handleChange = (index, text) => {
        const digit = text.replace(/\D/g, '').slice(-1);
        const next = Array.from({ length }, (_, position) => digits[position] ?? '');

        next[index] = digit;
        onChangeText?.(next.join(''));

        if (digit) {
            focusAt(index + 1);
        }
    };

    const handleKeyPress = (index, event) => {
        if (event?.nativeEvent?.key === 'Backspace' && !digits[index]) {
            focusAt(index - 1);
        }
    };

    // El reenvío solo se habilita al terminar la cuenta y reinicia el contador.
    const resendEnabled = secondsLeft <= 0;
    const countdownLabel = `${Math.floor(secondsLeft / 60)}:${String(
        secondsLeft % 60
    ).padStart(2, '0')}`;
    const displayResendLabel = resendEnabled
        ? resendLabel
        : `${resendLabel} (${countdownLabel})`;

    const handleResend = () => {
        if (!resendEnabled) return;

        onResend?.();
        setSecondsLeft(initialSeconds);
    };

    return (
        <View {...rest} style={[styles.container, style]}>
            {label ? (
                <Text variant="label" color="text">
                    {label}
                </Text>
            ) : null}

            <View style={styles.row}>
                {Array.from({ length }, (_, index) => (
                    <DigitInput
                        key={index}
                        ref={(node) => {
                            inputs.current[index] = node;
                        }}
                        style={[styles.digit, error && styles.digitError]}
                        value={digits[index] ?? ''}
                        onChangeText={(text) => handleChange(index, text)}
                        onKeyPress={(event) => handleKeyPress(index, event)}
                        autoFocus={autoFocus && index === 0}
                        accessibilityLabel={`Dígito ${index + 1} de ${length}`}
                    />
                ))}
            </View>

            <Text
                variant="caption"
                color={resendEnabled ? 'primary' : 'notselected'}
                onPress={resendEnabled ? handleResend : undefined}
                accessibilityState={{ disabled: !resendEnabled }}
            >
                {displayResendLabel}
            </Text>

            {error ? (
                <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
                    {error}
                </Text>
            ) : null}
        </View>
    );
}
