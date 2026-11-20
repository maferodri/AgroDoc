/**
 * Documento: molécula Callout.
 * Bloque de aviso con fondo gris para notas que acompañan a un formulario.
 * No comunica estado ni urgencia: para eso existe el organismo Alert.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './Callout.styles';

/**
 * @param {string} message Texto del aviso.
 */
export function Callout({ message, style, ...rest }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <Text variant="body" color="notselected">
                {message}
            </Text>
        </View>
    );
}
