/**
 * Documento: lobby del agricultor (web).
 * La web es de consulta: el diagnóstico por cámara vive solo en la app móvil.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '@agrodoc/ui';

export default function FarmerLobby() {
    const theme = useTheme();
    const styles = useMemo(
        () => ({
            screen: {
                flex: 1,
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.sm,
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.background,
            },
        }),
        [theme]
    );

    return (
        <View style={styles.screen}>
            <Text variant="title">Panel del agricultor</Text>
            <Text variant="body" color="notselected" align="center">
                Para tomar fotos y diagnosticar tus cultivos usa la app móvil
                de AgroDoc.
            </Text>
        </View>
    );
}
