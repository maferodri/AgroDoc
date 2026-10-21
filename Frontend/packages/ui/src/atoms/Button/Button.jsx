// packages/ui/src/atoms/Button/Button.jsx
import React, { useMemo } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './Button.styles';

export function Button({
    title,
    onPress,
    variant = 'primary', // primary | secondary | danger | ghost
    disabled = false,
    loading = false,
    fullWidth = false,
    }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isDisabled = disabled || loading;

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
            <ActivityIndicator color={styles.labelVariant[variant].color} />
        ) : (
            <Text style={[styles.label, styles.labelVariant[variant]]}>
            {title}
            </Text>
        )}
        </Pressable>
    );
}