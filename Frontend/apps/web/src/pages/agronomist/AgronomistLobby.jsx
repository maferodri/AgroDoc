/**
 * Documento: bandeja del agrónomo (web).
 * Muestra las consultas pendientes con la foto del cultivo, el diagnóstico y
 * su nivel de confianza para priorizar la revisión.
 */
import { useMemo } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useConsultations } from '@agrodoc/features';
import { ConfidenceBar, Text, useTheme } from '@agrodoc/ui';
import { getStyles } from './AgronomistLobby.styles';

export default function AgronomistLobby() {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const consultationsQuery = useConsultations();
    const consultations = consultationsQuery.data ?? [];

    return (
        <ScrollView
            testID="agronomist-inbox"
            style={styles.screen}
            contentContainerStyle={styles.content}
        >
            <Text variant="title">Bandeja de consultas</Text>

            {consultationsQuery.isLoading ? (
                <Text color="notselected">Cargando consultas…</Text>
            ) : null}

            {consultationsQuery.isError ? (
                <Text color="danger">
                    No se pudieron cargar las consultas.
                </Text>
            ) : null}

            {consultations.map((consultation) => (
                <View key={consultation.id} style={styles.card}>
                    <Image
                        source={{ uri: consultation.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                        accessibilityLabel={`Foto del cultivo de ${consultation.farmer_name}`}
                    />

                    <View style={styles.body}>
                        <Text variant="caption" color="notselected">
                            {consultation.farmer_name}
                        </Text>
                        <Text variant="subtitle">
                            {consultation.diagnosis.disease_name}
                        </Text>
                        <ConfidenceBar
                            value={consultation.diagnosis.confidence}
                        />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}
