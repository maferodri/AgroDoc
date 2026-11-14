/**
 * Documento: átomo Badge.
 * Etiqueta compacta de estado; solo presenta información recibida por props.
 */
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { BADGE_VARIANTS, getStyles } from './Badge.styles';

/**
 * @param {'healthy'|'warning'|'danger'|'premium'} [variant] Estado visual.
 * @param {React.ReactNode} children Texto corto del estado.
 */
export function Badge({ children, variant = 'healthy' }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const resolvedVariant = BADGE_VARIANTS.includes(variant)
        ? variant
        : 'healthy';
    const variantStyle = styles.variant[resolvedVariant];

    return (
        <View
            testID={`badge-${resolvedVariant}`}
            accessibilityRole="text"
            accessibilityLabel={
                typeof children === 'string' ? children : resolvedVariant
            }
            style={[styles.badge, { backgroundColor: variantStyle.backgroundColor }]}
        >
            <Text
                style={[
                    styles.label,
                    { color: variantStyle.color },
                ]}
            >
                {children}
            </Text>
        </View>
    );
}
