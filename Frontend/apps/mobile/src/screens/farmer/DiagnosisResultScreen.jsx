/**
 * Documento: resultado del diagnóstico (móvil).
 * Se abre después de que el modelo clasifica la foto. Muestra la imagen con
 * el patógeno y la confianza devueltos por el backend, y deja preparado el
 * botón de tratamiento (todavía deshabilitado).
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Button, Text, useTheme } from '@agrodoc/ui';
import { BottomNav } from '../../components/BottomNav';
import { DiagnosisInfo } from '../../components/DiagnosisInfo';
import { TopBar } from '../../components/TopBar';
import { getStyles } from './DiagnosisResultScreen.styles';

/**
 * Convierte la etiqueta del modelo (`cafe_roya`) en un nombre legible.
 *
 * @param {string} label Etiqueta cruda devuelta por `/detection/predict`.
 * @returns {string} Nombre con espacios y mayúsculas iniciales.
 */
function formatPestName(label) {
    return label
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

/**
 * @param {object} photo Fuente de la imagen capturada.
 * @param {{label: string, confidence: number}} prediction Resultado del modelo.
 * @param {() => void} onBack Vuelve al inicio.
 * @param {() => void} [onCapture] Abre la cámara para un nuevo análisis.
 */
export default function DiagnosisResultScreen({
    photo,
    prediction,
    onBack,
    onCapture,
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const confidence = Math.round(prediction.confidence * 100);

    return (
        <View style={styles.screen}>
            <TopBar
                title="Diagnóstico"
                leftAction={{
                    icon: 'chevronLeft',
                    label: 'Regresar',
                    onPress: onBack,
                }}
                rightActions={[
                    {
                        icon: 'bell',
                        label: 'Notificaciones',
                        disabled: true,
                    },
                ]}
            />

            <View style={styles.content}>
                <Text
                    variant="subtitle"
                    color="primary"
                    style={styles.heading}
                >
                    Resultado Del Diagnóstico
                </Text>

                <DiagnosisInfo
                    photo={photo}
                    pestName={formatPestName(prediction.label)}
                    confidence={confidence}
                />

                <Button title="Ver Tratamiento" fullWidth disabled />
            </View>

            <BottomNav activeKey="crops" onCapture={onCapture} />
        </View>
    );
}
