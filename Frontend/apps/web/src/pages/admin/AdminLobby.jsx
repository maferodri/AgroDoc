/**
 * Documento: lobby del administrador (web).
 * Vista temporal que confirma el rol y servirá de contenedor del panel.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '@agrodoc/ui';

export default function AdminLobby() {
    const theme = useTheme();
    const styles = useMemo(
        () => ({
            screen: {
                flex: 1,
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.surface,
            },
        }),
        [theme]
    );

    return (
        <View style={styles.screen}>
            <Text variant="title">Admin Lobby</Text>
        </View>
    );
}
