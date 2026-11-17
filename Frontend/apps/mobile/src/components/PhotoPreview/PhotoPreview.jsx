/**
 * Documento: molécula de la vista previa de la foto.
 * Tarjeta de imagen con esquinas redondeadas y el distintivo superpuesto en
 * la esquina superior derecha. Solo existe en móvil.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '@agrodoc/ui';
import { PhotoBadge } from '../PhotoBadge';
import { getStyles } from './PhotoPreview.styles';

/**
 * @param {object} source Fuente de la imagen (`require` o `{ uri }`).
 * @param {string} [label] Texto accesible de la imagen.
 * @param {boolean} [badge] Muestra el distintivo sobre la foto.
 */
export function PhotoPreview({
    source,
    label = 'Vista previa de la foto del cultivo',
    badge = true,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <View style={styles.frame}>
                <Image
                    source={source}
                    resizeMode="cover"
                    accessibilityRole="image"
                    accessibilityLabel={label}
                    style={styles.image}
                />
            </View>

            {badge ? <PhotoBadge style={styles.badge} /> : null}
        </View>
    );
}
