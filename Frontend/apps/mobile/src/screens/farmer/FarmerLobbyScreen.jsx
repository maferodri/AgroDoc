/**
 * Documento: lobby del agricultor (móvil).
 * Flujo principal: captura de foto → previsualización → análisis con
 * confianza. Si la confianza es baja, ofrece consultar a un agrónomo.
 */
import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import {
    DiagnosisResult,
    LogoutButton,
    useAnalyzeDiagnosis,
    useCreateConsultation,
} from '@agrodoc/features';
import { Button, Text, useTheme } from '@agrodoc/ui';

// Imagen local de ejemplo: evita depender de la cámara en las pruebas E2E.
const SAMPLE_PHOTO = require('../../../assets/icon.png');

export default function FarmerLobbyScreen() {
    const theme = useTheme();
    const [step, setStep] = useState('capture');
    const [diagnosis, setDiagnosis] = useState(null);
    const [consultationMessage, setConsultationMessage] = useState('');
    const analyze = useAnalyzeDiagnosis();
    const createConsultation = useCreateConsultation();

    const startPreview = () => {
        setDiagnosis(null);
        setConsultationMessage('');
        setStep('preview');
    };

    const runDiagnosis = () => {
        // La referencia identifica la foto; en producción será `image.imageUri`.
        analyze.mutate(
            { image: 'sample-crop' },
            {
                onSuccess: (result) => {
                    setDiagnosis(result);
                    setStep('result');
                },
            }
        );
    };

    const requestConsultation = () => {
        createConsultation.mutate(
            { diagnosisId: diagnosis.id },
            {
                onSuccess: () =>
                    setConsultationMessage(
                        'Consulta enviada. Un agrónomo revisará tu cultivo.'
                    ),
            }
        );
    };

    const reset = () => {
        setDiagnosis(null);
        setConsultationMessage('');
        setStep('capture');
    };

    return (
        <ScrollView
            testID="farmer-diagnosis"
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            contentContainerStyle={{
                padding: theme.spacing.lg,
                gap: theme.spacing.lg,
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: theme.spacing.sm,
                }}
            >
                <Text variant="subtitle">Diagnóstico de cultivos</Text>
                <LogoutButton />
            </View>

            {step === 'capture' ? (
                <View
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        gap: theme.spacing.md,
                    }}
                >
                    <Text variant="body" color="notselected" align="center">
                        Toma una foto clara de las hojas afectadas para
                        analizarla.
                    </Text>
                    <Button
                        title="Tomar foto"
                        onPress={startPreview}
                        fullWidth
                    />
                </View>
            ) : null}

            {step === 'preview' ? (
                <View
                    testID="photo-preview"
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        gap: theme.spacing.md,
                    }}
                >
                    <Image
                        source={SAMPLE_PHOTO}
                        style={{
                            width: '100%',
                            height: 260,
                            borderRadius: theme.radius.card,
                        }}
                        resizeMode="cover"
                        accessibilityLabel="Previsualización de la foto del cultivo"
                    />
                    <Button
                        title="Analizar foto"
                        onPress={runDiagnosis}
                        loading={analyze.isPending}
                        fullWidth
                    />
                    <Button
                        title="Repetir foto"
                        variant="ghost"
                        onPress={startPreview}
                        fullWidth
                    />
                    {analyze.isError ? (
                        <Text color="danger" align="center">
                            No se pudo analizar la foto. Intenta de nuevo.
                        </Text>
                    ) : null}
                </View>
            ) : null}

            {step === 'result' && diagnosis ? (
                <View style={{ width: '100%', gap: theme.spacing.md }}>
                    <DiagnosisResult
                        diagnosis={diagnosis}
                        onRequestConsultation={requestConsultation}
                        onRetry={reset}
                    />
                    {consultationMessage ? (
                        <Text color="success" align="center">
                            {consultationMessage}
                        </Text>
                    ) : null}
                </View>
            ) : null}
        </ScrollView>
    );
}
