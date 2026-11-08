/**
 * Documento: molécula StepIndicator.
 * Indicador de pasos compuesto por un número paramétrico de DynamicBar.
 * Cada barra se muestra al 100% si el paso está completado o al 0% si sigue
 * pendiente, replicando un progreso segmentado.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { DynamicBar } from '../../atoms/DynamicBar/DynamicBar';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './StepIndicator.styles';

/**
 * @param {number} [steps] Cantidad total de pasos.
 * @param {number} [completed] Pasos completados (se recorta entre 0 y `steps`).
 * @param {number} [height] Altura en px de cada barra.
 * @param {number} [gap] Separación en px entre barras; por defecto `spacing.sm`.
 * @param {string} [accessibilityLabel] Descripción para lectores de pantalla.
 */
export function StepIndicator({
    steps = 3,
    completed = 0,
    height,
    gap,
    style,
    accessibilityLabel,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme, gap), [theme, gap]);

    const total = Math.max(0, Math.floor(Number(steps) || 0));
    const done = Math.min(total, Math.max(0, Math.floor(Number(completed) || 0)));

    return (
        <View
            {...rest}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: total, now: done }}
            accessibilityLabel={
                accessibilityLabel ?? `Paso ${done} de ${total}`
            }
            style={[styles.container, style]}
        >
            {Array.from({ length: total }, (_, index) => (
                <View key={index} style={styles.segment}>
                    <DynamicBar
                        value={index < done ? 100 : 0}
                        height={height}
                        accessible={false}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        aria-hidden
                    />
                </View>
            ))}
        </View>
    );
}
