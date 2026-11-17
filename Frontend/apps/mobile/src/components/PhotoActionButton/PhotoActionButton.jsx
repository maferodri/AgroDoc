/**
 * Documento: molécula de acción para la vista previa de la foto.
 * Botón delineado con el icono encima del texto. Se usa para volver a tomar
 * la foto y para subir una imagen desde la galería. Solo existe en móvil.
 */
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Icon, Text, useTheme } from '@agrodoc/ui';
import { getStyles } from './PhotoActionButton.styles';

/**
 * @param {string} icon Nombre del icono del catálogo compartido.
 * @param {string} label Texto del botón.
 * @param {() => void} [onPress] Acción al pulsar el botón.
 * @param {boolean} [disabled] Bloquea la interacción y lo atenúa.
 */
export function PhotoActionButton({
    icon,
    label,
    onPress,
    disabled = false,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <Pressable
            {...rest}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Icon
                name={icon}
                size={theme.typography.fontSize.xl}
                color={theme.colors.primary}
            />
            <Text
                variant="caption"
                color="primary"
                align="center"
                style={styles.label}
            >
                {label}
            </Text>
        </Pressable>
    );
}
