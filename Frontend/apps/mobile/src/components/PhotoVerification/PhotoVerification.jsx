/**
 * Documento: organismo de verificación de la foto.
 * Reúne el título de la vista previa, la foto con su distintivo, las acciones
 * de repetir o subir una imagen, el consejo de iluminación y el botón para
 * continuar. Solo existe en móvil.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Button, Icon, Text, useTheme } from '@agrodoc/ui';
import { PhotoActionButton } from '../PhotoActionButton/PhotoActionButton';
import { PhotoPreview } from '../PhotoPreview/PhotoPreview';
import { getStyles } from './PhotoVerification.styles';

/**
 * @param {object} photo Fuente de la imagen capturada (`require` o `{ uri }`).
 * @param {() => void} [onRetake] Vuelve a la cámara para repetir la foto.
 * @param {boolean} [galleryDisabled] Deshabilita la subida desde galería.
 * @param {() => void} [onContinue] Continúa al análisis de la imagen.
 */
export function PhotoVerification({
    photo,
    onRetake,
    galleryDisabled = true,
    onContinue,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <View style={styles.header}>
                <Text
                    variant="subtitle"
                    color="primary"
                    style={styles.title}
                >
                    Vista Previa
                </Text>
                <Text variant="body" color="notselected">
                    Confirme su foto
                </Text>
            </View>

            <PhotoPreview source={photo} />

            <View style={styles.actions}>
                <PhotoActionButton
                    icon="cameraRotate"
                    label="Volver a Tomar Foto"
                    onPress={onRetake}
                />
                <PhotoActionButton
                    icon="imagePlus"
                    label="Subir Desde Galería"
                    disabled={galleryDisabled}
                />
            </View>

            <View style={styles.tip}>
                <Icon
                    name="bulb"
                    size={theme.typography.fontSize.xxl}
                    color={theme.colors.primary}
                />
                <View style={styles.tipContent}>
                    <Text variant="label" style={styles.tipTitle}>
                        Buena Iluminación
                    </Text>
                    <Text variant="caption" color="notselected">
                        Evite sombras fuertes y luz solar directa sobre la
                        muestra.
                    </Text>
                </View>
            </View>

            <Button title="Continuar" fullWidth onPress={onContinue} />
        </View>
    );
}
