/**
 * Documento: bloqueo del panel admin en móvil.
 * El rol administrador solo opera en la web; la app le impide entrar al panel
 * y le ofrece cerrar sesión.
 */
import { View } from 'react-native';
import { LogoutButton } from '@agrodoc/features';
import { Text, useTheme } from '@agrodoc/ui';

export default function AdminNotAllowedScreen() {
    const theme = useTheme();

    return (
        <View
            testID="admin-mobile-blocked"
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: theme.spacing.md,
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.background,
            }}
        >
            <Text variant="title" align="center">
                Acceso no disponible en móvil
            </Text>
            <Text variant="body" color="notselected" align="center">
                El panel de administración solo está disponible en la versión
                web de AgroDoc.
            </Text>
            <LogoutButton label="Volver al inicio" variant="primary" />
        </View>
    );
}
