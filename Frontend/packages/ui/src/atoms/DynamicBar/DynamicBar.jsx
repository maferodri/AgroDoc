/**
 * Documento: átomo DynamicBar.
 * Barra horizontal con una pista gris y un relleno verde cuyo ancho es
 * paramétrico (0-100). Sirve como base de progreso, carga o cantidad.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './DynamicBar.styles';

/**
 * Limita el porcentaje al rango válido para evitar anchos negativos o
 * mayores que la pista.
 * @param {number|string} value Porcentaje recibido.
 */
function clampPercentage(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.min(100, Math.max(0, numeric));
}

/**
 * @param {number} [value] Porcentaje ocupado por la barra verde (0-100).
 * @param {number} [height] Altura en px; por defecto `theme.size.dynamicBar`.
 * @param {string} [color] Color semántico del relleno; por defecto `primary`.
 * @param {boolean} [accessible] Expone la barra a lectores de pantalla.
 * @param {string} [accessibilityLabel] Descripción para lectores de pantalla.
 */
export function DynamicBar({
    value = 0,
    height,
    color,
    accessible = true,
    style,
    accessibilityLabel,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const percentage = clampPercentage(value);
    const barHeight = typeof height === 'number'
        ? height
        : theme.size?.dynamicBar ?? 8;
    const fillColor = color
        ? theme.colors?.[color] ?? theme.colors.primary
        : theme.colors.primary;

    return (
        <View
            {...rest}
            accessible={accessible}
            accessibilityRole="progressbar"
            accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(percentage),
            }}
            accessibilityLabel={accessibilityLabel}
            style={[
                styles.track,
                { height: barHeight },
                style,
            ]}
        >
            <View
                style={[
                    styles.fill,
                    {
                        width: `${percentage}%`,
                        backgroundColor: fillColor,
                    },
                ]}
            />
        </View>
    );
}
