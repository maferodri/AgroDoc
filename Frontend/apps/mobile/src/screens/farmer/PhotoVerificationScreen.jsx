/**
 * Documento: verificación de la foto (móvil).
 * Se abre después de capturar una imagen. Muestra el encabezado con regreso,
 * el organismo de verificación y la barra de navegación inferior.
 */
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@agrodoc/ui';
import { BottomNav } from '../../components/BottomNav';
import { PhotoVerification } from '../../components/PhotoVerification';
import { TopBar } from '../../components/TopBar';
import { getStyles } from './PhotoVerificationScreen.styles';

/**
 * @param {object} photo Fuente de la imagen capturada.
 * @param {() => void} onBack Vuelve al inicio.
 * @param {() => void} onRetake Vuelve a la cámara.
 * @param {() => void} [onContinue] Continúa al análisis.
 */
export default function PhotoVerificationScreen({
    photo,
    onBack,
    onRetake,
    onContinue,
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View style={styles.screen}>
            <TopBar
                title="Análisis"
                leftAction={{
                    icon: 'chevronLeft',
                    label: 'Regresar',
                    onPress: onBack,
                }}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <PhotoVerification
                    photo={photo}
                    onRetake={onRetake}
                    onContinue={onContinue}
                />
            </ScrollView>

            <BottomNav activeKey="home" onCapture={onRetake} />
        </View>
    );
}
