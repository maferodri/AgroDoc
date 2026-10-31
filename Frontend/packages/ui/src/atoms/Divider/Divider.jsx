/**
 * Documento: átomo Divider.
 * Línea horizontal fina para separar contenido; puede usarse suelta o
 * dentro de una fila con `flex: 1`.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './Divider.styles';

/**
 * @param {object} [style] Estilo adicional, por ejemplo `{ flex: 1 }`.
 */
export function Divider({ style, ...rest }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return <View {...rest} style={[styles.line, style]} />;
}
