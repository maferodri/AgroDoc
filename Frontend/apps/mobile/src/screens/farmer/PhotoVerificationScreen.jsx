/**
 * Documento: verificación de la foto (móvil).
 * Se abre después de capturar una imagen. Muestra el encabezado con regreso,
 * el organismo de verificación y la barra de navegación inferior. Al continuar
 * envía la foto a `/detection/predict` y muestra el progreso en un modal.
 */
import { useMemo, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { File } from 'expo-file-system';
import { usePredictImage } from '@agrodoc/features';
import { useTheme } from '@agrodoc/ui';
import { validatePhotoFile } from '@agrodoc/utils';
import { AnalysisModal } from '../../components/AnalysisModal';
import { BottomNav } from '../../components/BottomNav';
import { PhotoVerification } from '../../components/PhotoVerification';
import { TopBar } from '../../components/TopBar';
import { getStyles } from './PhotoVerificationScreen.styles';

/**
 * Convierte la foto en una parte válida para `FormData`.
 * En web la cámara entrega un data URL; en nativo, un archivo local. El
 * `File` de `expo-file-system` es lo recomendado para `expo/fetch`, con un
 * fallback a `Blob` si el módulo nativo no está disponible en el build.
 */
async function toPhotoPart(photo) {
    if (Platform.OS !== 'web') {
        try {
            return new File(photo.uri);
        } catch {
            // Fallback cuando `expo-file-system` no está en el binario actual.
        }
    }

    return (await fetch(photo.uri)).blob();
}

/**
 * @param {object} photo Fuente de la imagen capturada.
 * @param {() => void} onBack Vuelve al inicio.
 * @param {() => void} onRetake Vuelve a la cámara.
 * @param {(prediction: object) => void} [onAnalyzed] Abre el resultado.
 */
export default function PhotoVerificationScreen({
    photo,
    onBack,
    onRetake,
    onAnalyzed,
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const predict = usePredictImage();
    const [analysisStatus, setAnalysisStatus] = useState(null);
    const [prediction, setPrediction] = useState(null);

    // Envía la foto y refleja el resultado en el modal de estado.
    const handleContinue = async () => {
        try {
            const file = await toPhotoPart(photo);
            const photoError = validatePhotoFile(file);

            if (photoError) {
                Alert.alert('Foto no válida', photoError);
                return;
            }

            setAnalysisStatus('loading');
            predict.mutate(
                { file },
                {
                    onSuccess: (result) => {
                        setPrediction(result);
                        setAnalysisStatus('success');
                    },
                    onError: (error) => {
                        setAnalysisStatus(null);
                        Alert.alert(
                            'No se pudo analizar la foto',
                            error.message
                        );
                    },
                }
            );
        } catch (error) {
            setAnalysisStatus(null);
            Alert.alert('No se pudo analizar la foto', error.message);
        }
    };

    // Cierra el modal y pasa la predicción a la pantalla de resultados.
    const handleResult = () => {
        if (!prediction) {
            return;
        }

        setAnalysisStatus(null);
        onAnalyzed?.(prediction);
    };

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

            <View style={styles.content}>
                <PhotoVerification
                    photo={photo}
                    onRetake={onRetake}
                    onContinue={handleContinue}
                />
            </View>

            <BottomNav activeKey="home" onCapture={onRetake} />

            <AnalysisModal
                visible={analysisStatus !== null}
                status={analysisStatus}
                onContinue={handleResult}
            />
        </View>
    );
}
