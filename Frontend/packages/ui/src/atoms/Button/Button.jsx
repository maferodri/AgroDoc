/**
 * Documento: átomo Button.
 * Botón con variantes, estados y soporte opcional de icono.
 */
import React, { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './Button.styles';

/**
 * @param {string} title Texto del botón.
 * @param {React.ReactNode} [icon] Icono opcional a la izquierda del texto.
 */
export function Button({
    title,
    icon,
    onPress,
    variant = 'primary', // primary | secondary | danger | ghost
    disabled = false,
    loading = false,
    fullWidth = false,
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isDisabled = disabled || loading;
    const indicatorColor = {
        primary: theme.colors.textOnPrimary,
        secondary: theme.colors.special,
        danger: theme.colors.textOnPrimary,
        ghost: theme.colors.primary,
    }[variant] ?? theme.colors.textOnPrimary;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={({ pressed }) => [
                styles.container,
                styles.variant[variant],
                fullWidth && styles.fullWidth,
                pressed && styles.pressed,
                isDisabled && styles.disabled,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={indicatorColor} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.label, styles.labelVariant[variant]]}>
                        {title}
                    </Text>
                </>
            )}
        </Pressable>
    );
}
