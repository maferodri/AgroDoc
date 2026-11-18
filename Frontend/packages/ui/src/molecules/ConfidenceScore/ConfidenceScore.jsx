/**
 * Documento: molécula del porcentaje de confianza.
 * Muestra la etiqueta y el entero redondeado que devuelve el diagnóstico.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { formatConfidence } from '@agrodoc/utils';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './ConfidenceScore.styles';

/**
 * @param {number} value Porcentaje de confianza (0-100).
 * @param {string} [label] Etiqueta que precede al porcentaje.
 */
export function ConfidenceScore({
    value,
    label = 'Confianza',
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const formatted = formatConfidence(value);

    return (
        <View
            {...rest}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${label} ${formatted}`}
            style={[styles.container, style]}
        >
            <Text variant="caption" color="textOnPrimary" style={styles.label}>
                {label}
            </Text>
            <Text variant="subtitle" color="textOnPrimary" style={styles.value}>
                {formatted}
            </Text>
        </View>
    );
}
