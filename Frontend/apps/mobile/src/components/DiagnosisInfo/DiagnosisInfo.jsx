/**
 * Documento: organismo de información del diagnóstico (móvil).
 * Reúne la foto diagnosticada y, sobre un degradado verde, el nombre del
 * patógeno y la confianza que devolvió el modelo. Solo existe en móvil porque
 * reutiliza la vista previa de la cámara.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ConfidenceScore, PestName, Text, useTheme } from '@agrodoc/ui';
import { PhotoPreview } from '../PhotoPreview';
import { getStyles } from './DiagnosisInfo.styles';

/**
 * @param {object} photo Fuente de la imagen capturada (`require` o `{ uri }`).
 * @param {string} pestName Nombre del patógeno detectado.
 * @param {number} confidence Porcentaje de confianza (0-100).
 */
export function DiagnosisInfo({
    photo,
    pestName,
    confidence,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <PhotoPreview
                source={photo}
                badge={false}
                label="Foto del cultivo diagnosticado"
            />

            {/* Degradado verde con esquinas superiores redondeadas. */}
            <LinearGradient
                colors={[
                    `${theme.colors.special}00`,
                    `${theme.colors.special}99`,
                    `${theme.colors.special}E6`,
                ]}
                locations={[0, 0.55, 1]}
                pointerEvents="none"
                style={styles.scrim}
            />

            <View style={styles.overlay}>
                <Text variant="caption" color="textOnPrimary" style={styles.overline}>
                    RESULTADO
                </Text>
                <PestName name={pestName} />
                <ConfidenceScore value={confidence} />
            </View>
        </View>
    );
}
