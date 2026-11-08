/**
 * Documento: átomo Text.
 * Texto tipográfico con variantes, color semántico, alineación y recorte.
 */
import { useMemo } from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import {
    TEXT_ALIGNS,
    TEXT_COLORS,
    TEXT_VARIANTS,
    getStyles,
} from './Text.styles';

/**
 * @param {'title'|'subtitle'|'body'|'caption'|'label'|'link'} [variant] Rol tipográfico.
 * @param {'text'|'primary'|'danger'|'success'|string} [color] Nombre semántico del tema.
 * @param {'left'|'center'|'right'} [align] Alineación horizontal.
 * @param {number} [numberOfLines] Recorta el texto con "..." al superar las líneas.
 * @param {() => void} [onPress] Convierte el texto en un enlace interactivo.
 */
export function Text({
    children,
    variant = 'body',
    color,
    align = 'left',
    numberOfLines,
    onPress,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const resolvedVariant = TEXT_VARIANTS.includes(variant) ? variant : 'body';
    const defaultColor = resolvedVariant === 'link' ? 'primary' : 'text';
    const resolvedColor = color == null
        ? defaultColor
        : TEXT_COLORS.includes(color)
            ? color
            : defaultColor;
    const resolvedAlign = TEXT_ALIGNS.includes(align) ? align : 'left';

    if (process.env.NODE_ENV !== 'production') {
        if (resolvedVariant !== variant) {
            console.warn(
                `Text: variante "${variant}" no existe. Usa: ${TEXT_VARIANTS.join(', ')}`
            );
        }
        if (color != null && resolvedColor !== color) {
            console.warn(
                `Text: color "${color}" no es semántico. Usa: ${TEXT_COLORS.join(', ')}`
            );
        }
    }

    return (
        <RNText
            {...rest}
            onPress={onPress}
            accessibilityRole={
                rest.accessibilityRole ??
                (resolvedVariant === 'link' && onPress ? 'link' : undefined)
            }
            numberOfLines={numberOfLines}
            style={[
                styles.variant[resolvedVariant],
                styles.color[resolvedColor],
                styles.align[resolvedAlign],
                style,
            ]}
        >
            {children}
        </RNText>
    );
}
