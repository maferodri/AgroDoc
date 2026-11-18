/**
 * Documento: molécula del nombre del patógeno.
 * Presenta la etiqueta y el nombre que devuelve el modelo de detección.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './PestName.styles';

/**
 * @param {string} name Nombre del patógeno detectado.
 * @param {string} [label] Etiqueta que precede al nombre.
 */
export function PestName({
    name,
    label = 'Patógeno',
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <Text variant="caption" color="warning" style={styles.label}>
                {label}:
            </Text>
            <Text variant="subtitle" color="textOnPrimary" style={styles.name}>
                {name}
            </Text>
        </View>
    );
}
