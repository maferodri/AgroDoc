/**
 * Documento: organismo GreetingTitle.
 * Título de bienvenida del inicio: saludo pequeño en gris y nombre grande en
 * el color primario. Se usa igual en web y móvil, por eso vive en @agrodoc/ui.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './GreetingTitle.styles';

/**
 * @param {string} greeting Saludo según el momento del día (p. ej. "Buenos Días").
 * @param {string} name Nombre visible del agricultor.
 */
export function GreetingTitle({ greeting, name, style, ...rest }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <Text variant="subtitle" color="notselected" style={styles.greeting}>
                {greeting}
            </Text>
            <Text variant="title" color="primary" style={styles.name}>
                {name}
            </Text>
        </View>
    );
}
