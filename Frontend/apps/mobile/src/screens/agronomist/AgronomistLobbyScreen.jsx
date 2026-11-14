/**
 * Documento: lobby del agrónomo (móvil).
 * Vista temporal que confirma el rol y servirá de contenedor del panel.
 */
import { View } from 'react-native';
import { Text, useTheme } from '@agrodoc/ui';

export default function AgronomistLobbyScreen() {
    const theme = useTheme();

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.surface,
            }}
        >
            <Text variant="title">Agronomist Lobby</Text>
        </View>
    );
}
