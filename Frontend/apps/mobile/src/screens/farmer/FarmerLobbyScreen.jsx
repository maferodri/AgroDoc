/**
 * Documento: inicio del agricultor (móvil).
 * Solo muestra el encabezado, el saludo y la barra de navegación. La cámara
 * se abre desde la acción central de la barra inferior y, tras capturar la
 * foto, se pasa a la verificación de la imagen.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '@agrodoc/features';
import { GreetingTitle, useTheme } from '@agrodoc/ui';
import { BottomNav } from '../../components/BottomNav';
import { TopBar } from '../../components/TopBar';
import CameraScreen from './CameraScreen';
import PhotoVerificationScreen from './PhotoVerificationScreen';

export default function FarmerLobbyScreen() {
    const theme = useTheme();
    const { user } = useAuth();
    const [view, setView] = useState('home');
    const [photo, setPhoto] = useState(null);

    if (view === 'camera') {
        return (
            <CameraScreen
                onBack={() => setView('home')}
                onCapture={(captured) => {
                    setPhoto(captured);
                    setView('verify');
                }}
            />
        );
    }

    if (view === 'verify' && photo) {
        return (
            <PhotoVerificationScreen
                photo={photo}
                onBack={() => setView('home')}
                onRetake={() => setView('camera')}
            />
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <TopBar
                title="Inicio"
                leftAction={{ icon: 'person', label: 'Perfil', disabled: true }}
                rightActions={[
                    {
                        icon: 'bell',
                        label: 'Notificaciones',
                        disabled: true,
                    },
                ]}
            />

            <View style={{ flex: 1, padding: theme.spacing.lg }}>
                <GreetingTitle
                    greeting="Buenos Días"
                    name={user?.full_name ?? 'Agricultor'}
                />
            </View>

            <BottomNav
                activeKey="home"
                onCapture={() => setView('camera')}
            />
        </View>
    );
}
