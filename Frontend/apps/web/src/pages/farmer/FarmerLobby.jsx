/**
 * Documento: lobby del agricultor (web).
 * La web es de consulta: el diagnóstico por cámara vive solo en la app móvil.
 * Incluye la barra lateral con únicamente la sección de inicio habilitada y
 * el saludo del inicio.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { useAuth } from '@agrodoc/features';
import { GreetingTitle, Text, useTheme } from '@agrodoc/ui';
import { SidebarNav } from '../../components/SidebarNav';

/** Secciones y acciones que todavía no tienen pantalla en la web. */
const DISABLED_KEYS = [
    'crops',
    'history',
    'queries',
    'payments',
    'settings',
    'premium',
    'logout',
];

export default function FarmerLobby() {
    const theme = useTheme();
    const { user } = useAuth();
    const styles = useMemo(
        () => ({
            screen: {
                flex: 1,
                flexDirection: 'row',
                minHeight: '100vh',
                backgroundColor: theme.colors.background,
            },
            sidebar: {
                width: 320,
                borderRightWidth: 1,
                borderRightColor: theme.colors.border,
            },
            content: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: theme.spacing.sm,
                padding: theme.spacing.lg,
            },
        }),
        [theme]
    );

    return (
        <View style={styles.screen}>
            <View style={styles.sidebar}>
                <SidebarNav activeKey="home" disabledKeys={DISABLED_KEYS} />
            </View>

            <View style={styles.content}>
                <GreetingTitle
                    greeting="Buenos Días"
                    name={user?.full_name ?? 'Agricultor'}
                />
                <Text variant="body" color="notselected" align="center">
                    Para tomar fotos y diagnosticar tus cultivos usa la app
                    móvil de AgroDoc.
                </Text>
            </View>
        </View>
    );
}
