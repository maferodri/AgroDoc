import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, typography }) => {
    const base = StyleSheet.create({
        container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.buttonY,
        paddingHorizontal: spacing.buttonX,
        borderRadius: radius.button,
        },
        fullWidth: { alignSelf: 'stretch' },
        pressed: { opacity: 0.85 },
        disabled: { opacity: 0.5 },
        label: {
        fontSize: typography.button.fontSize,
        fontWeight: typography.button.fontWeight,
        },
    });

    const variant = StyleSheet.create({
        primary:   { backgroundColor: colors.primary },
        secondary: { backgroundColor: colors.secondary },
        danger:    { backgroundColor: colors.danger },
        ghost:     { backgroundColor: 'transparent' },
    });

    const labelVariant = StyleSheet.create({
        primary:   { color: colors.textOnPrimary },
        secondary: { color: colors.special },
        danger:    { color: colors.textOnPrimary },
        ghost:     { color: colors.primary },
    });

    return { ...base, variant, labelVariant };
};