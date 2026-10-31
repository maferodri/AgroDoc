/**
 * Documento: molécula OrDivider.
 * Divisor con etiqueta centrada (`──── o ────`) para separar dos opciones,
 * por ejemplo el login con correo de otros métodos de acceso.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Divider } from '../../atoms/Divider/Divider';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './OrDivider.styles';

/**
 * @param {string} [label] Texto centrado entre las líneas.
 */
export function OrDivider({ label = 'o', style, ...rest }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <Divider style={styles.line} />
            <Text variant="caption" color="text" style={styles.label}>
                {label}
            </Text>
            <Divider style={styles.line} />
        </View>
    );
}
