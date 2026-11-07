/**
 * Documento: molécula ConfidenceBar.
 * Muestra la confianza de un diagnóstico como entero y colorea la barra según
 * los umbrales compartidos de `@agrodoc/utils`.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import {
    formatConfidence,
    getConfidenceLevel,
    requiresAgronomist,
} from '@agrodoc/utils';
import { DynamicBar } from '../../atoms/DynamicBar/DynamicBar';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './ConfidenceBar.styles';

/**
 * @param {number} value Porcentaje de confianza (0-100).
 * @param {string} [label] Etiqueta sobre la barra.
 * @param {boolean} [showHint] Muestra la recomendación de agrónomo.
 */
export function ConfidenceBar({
    value,
    label = 'Confianza del diagnóstico',
    showHint = true,
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const numeric = Number(value);
    const safeValue = Number.isFinite(numeric)
        ? Math.min(100, Math.max(0, numeric))
        : 0;
    const level = getConfidenceLevel(safeValue);
    const formatted = formatConfidence(safeValue);
    const needsAgronomist = requiresAgronomist(safeValue);

    return (
        <View
            testID="confidence-bar"
            dataSet={{ level }}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`${label}: ${formatted} (${level})`}
            accessibilityValue={{ min: 0, max: 100, now: Math.round(safeValue) }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text
                    testID="confidence-value"
                    style={[styles.value, { color: styles.colors[level] }]}
                >
                    {formatted}
                </Text>
            </View>

            <DynamicBar
                value={safeValue}
                color={level === 'high' ? 'success' : level === 'medium' ? 'warning' : 'danger'}
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                aria-hidden
            />

            {showHint && needsAgronomist ? (
                <Text testID="confidence-hint" style={styles.hint}>
                    Confianza baja: se recomienda consultar a un agrónomo.
                </Text>
            ) : null}
        </View>
    );
}
