/**
 * Documento: molécula del distintivo de la vista previa.
 * Círculo dorado con la chispa que marca la foto como lista para analizar.
 * Por ahora siempre muestra el mismo icono. Solo existe en móvil.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Icon, useTheme } from '@agrodoc/ui';
import { getStyles } from './PhotoBadge.styles';

/**
 * @param {string} [icon] Nombre del icono del catálogo compartido.
 * @param {string} [label] Texto accesible del distintivo.
 */
export function PhotoBadge({
    icon = 'sparkle',
    label = 'Foto lista para analizar',
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View
            {...rest}
            accessible
            accessibilityRole="image"
            accessibilityLabel={label}
            style={[styles.container, style]}
        >
            <Icon
                name={icon}
                size={theme.typography.fontSize.xxl}
                color={theme.colors.primary}
            />
        </View>
    );
}
