/**
 * Documento: resultado del diagnóstico.
 * Presenta la enfermedad detectada, la confianza y, cuando el nivel es bajo,
 * ofrece crear una consulta con un agrónomo. Solo recibe datos por props.
 */
import { View } from 'react-native';
import {
    Badge,
    Button,
    ConfidenceBar,
    Text,
    useTheme,
} from '@agrodoc/ui';
import { requiresAgronomist } from '@agrodoc/utils';

/**
 * @param {object} diagnosis Diagnóstico validado por el backend.
 * @param {() => void} [onRequestConsultation] Abre la consulta con agrónomo.
 * @param {() => void} [onRetry] Vuelve a capturar la foto.
 */
export function DiagnosisResult({
    diagnosis,
    onRequestConsultation,
    onRetry,
}) {
    const theme = useTheme();
    const needsAgronomist = requiresAgronomist(diagnosis.confidence);

    return (
        <View
            testID="diagnosis-result"
            style={{ gap: theme.spacing.md, alignSelf: 'stretch' }}
        >
            <Badge variant={needsAgronomist ? 'danger' : 'healthy'}>
                {needsAgronomist ? 'Revisión recomendada' : 'Diagnóstico confiable'}
            </Badge>

            <Text variant="title">{diagnosis.disease_name}</Text>
            <Text variant="body" color="notselected">
                {diagnosis.description}
            </Text>

            <ConfidenceBar value={diagnosis.confidence} />

            {diagnosis.recommendations?.length ? (
                <View style={{ gap: theme.spacing.xs }}>
                    <Text variant="label">Recomendaciones</Text>
                    {diagnosis.recommendations.map((item) => (
                        <Text key={item} variant="body" color="notselected">
                            {`• ${item}`}
                        </Text>
                    ))}
                </View>
            ) : null}

            {needsAgronomist ? (
                <Button
                    title="Consultar con un agrónomo"
                    fullWidth
                    onPress={onRequestConsultation}
                />
            ) : null}

            {onRetry ? (
                <Button
                    title="Analizar otra foto"
                    variant="ghost"
                    fullWidth
                    onPress={onRetry}
                />
            ) : null}
        </View>
    );
}
