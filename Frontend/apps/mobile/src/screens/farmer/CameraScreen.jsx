/**
 * Documento: pantalla de captura (móvil).
 * Muestra la cámara con un encabezado transparente, la guía de encuadre y
 * los controles de galería y disparo. Recibe el regreso por props.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Button, Icon, Text, useTheme } from '@agrodoc/ui';
import { TopBar } from '../../components/TopBar';
import { getStyles } from './CameraScreen.styles';

/**
 * @param {() => void} onBack Vuelve a la pantalla anterior.
 * @param {(photo: object) => void} [onCapture] Recibe la foto tomada.
 */
export default function CameraScreen({ onBack, onCapture }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const cameraRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();

    // Pide el permiso al entrar para mostrar la vista previa de inmediato.
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const takePhoto = useCallback(async () => {
        const photo = await cameraRef.current?.takePictureAsync({
            quality: 0.8,
        });
        if (photo) {
            onCapture?.(photo);
        }
    }, [onCapture]);

    const granted = permission?.granted ?? false;

    return (
        <View style={styles.screen}>
            <StatusBar style="light" />

            {granted ? (
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                />
            ) : (
                <View style={styles.permission}>
                    <Text color="textOnPrimary" align="center">
                        Necesitamos acceso a tu cámara para fotografiar tus
                        cultivos.
                    </Text>
                    <Button
                        title="Permitir cámara"
                        onPress={requestPermission}
                    />
                </View>
            )}

            <View style={styles.overlay} pointerEvents="box-none">
                <TopBar
                    variant="transparent"
                    title="Captura"
                    leftAction={{
                        icon: 'chevronLeft',
                        label: 'Regresar',
                        onPress: onBack,
                    }}
                />

                {granted ? (
                    <>
                        <View style={styles.viewfinder} pointerEvents="none">
                            <View
                                style={[styles.corner, styles.cornerTopLeft]}
                            />
                            <View
                                style={[styles.corner, styles.cornerTopRight]}
                            />
                            <View
                                style={[
                                    styles.corner,
                                    styles.cornerBottomLeft,
                                ]}
                            />
                            <View
                                style={[
                                    styles.corner,
                                    styles.cornerBottomRight,
                                ]}
                            />
                        </View>

                        <View style={styles.controls}>
                            {/* La galería es solo visual por ahora. */}
                            <View style={styles.gallery}>
                                <Icon
                                    name="image"
                                    size={theme.typography.fontSize.xxl}
                                    color={theme.colors.textOnPrimary}
                                />
                            </View>
                            <Pressable
                                onPress={takePhoto}
                                accessibilityRole="button"
                                accessibilityLabel="Tomar foto"
                                style={({ pressed }) => [
                                    styles.shutter,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <View style={styles.shutterInner} />
                            </Pressable>
                        </View>
                    </>
                ) : null}
            </View>
        </View>
    );
}
