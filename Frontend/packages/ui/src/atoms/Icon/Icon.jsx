/**
 * Documento: átomo Icon.
 * Renderiza un icono SVG con tamaño y color derivados del tema.
 */
import { Svg } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';
import { ICONS, ICON_NAMES } from './icons';
import { styles } from './Icon.styles';

/**
 * @param {keyof typeof ICONS} name Nombre del icono.
 * @param {number} [size] Tamaño en px. Por defecto usa `typography.fontSize.xl`.
 * @param {string} [color] Color explícito; tiene prioridad sobre `active`.
 * @param {boolean} [active] Si se define, usa `colors.primary` o `colors.notselected`.
 */
export function Icon({ name, size, color, active, style, ...rest }) {
    const theme = useTheme();
    const definition = ICONS[name];

    if (!definition) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(
                `Icon "${name}" no existe. Disponibles: ${ICON_NAMES.join(', ')}`
            );
        }
        return null;
    }

    const resolvedSize = size ?? theme.typography.fontSize.xl;
    const resolvedColor = color ?? (
        active === undefined
            ? theme.colors.text
            : active
                ? theme.colors.primary
                : theme.colors.notselected
    );

    return (
        <Svg
            width={resolvedSize}
            height={resolvedSize}
            viewBox={definition.viewBox}
            style={[styles.icon, style]}
            {...rest}
        >
            {definition.render(resolvedColor)}
        </Svg>
    );
}
