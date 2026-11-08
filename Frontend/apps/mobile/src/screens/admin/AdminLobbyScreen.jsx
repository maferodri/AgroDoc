/**
 * Documento: lobby del administrador (móvil).
 * Vista temporal que confirma el rol; el panel de administración es web.
 */
import { View } from 'react-native';
import { Text, useTheme } from '@agrodoc/ui';

export default function AdminLobbyScreen() {
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
            <Text variant="title">Admin Lobby</Text>
        </View>
    );
}
