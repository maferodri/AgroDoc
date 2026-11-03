/**
 * Documento: navegación raíz de la app móvil.
 * Decide entre el login y el lobby del rol con la sesión del feature auth.
 */
import { useState } from 'react';
import { useAuth } from '@agrodoc/features';
import AdminLobbyScreen from '../screens/admin/AdminLobbyScreen';
import AgronomistLobbyScreen from '../screens/agronomist/AgronomistLobbyScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import FarmerLobbyScreen from '../screens/farmer/FarmerLobbyScreen';

/** Lobby que corresponde a cada rol del backend. */
const LOBBY_BY_ROLE = {
    farmer: FarmerLobbyScreen,
    agronomist: AgronomistLobbyScreen,
    admin: AdminLobbyScreen,
};

/**
 * Pantallas públicas de autenticación.
 * Al montarse arranca en login, así que cerrar sesión siempre vuelve al login.
 */
function PublicAuth() {
    const [screen, setScreen] = useState('login');

    return screen === 'register' ? (
        <RegisterScreen onLogin={() => setScreen('login')} />
    ) : (
        <LoginScreen onRegister={() => setScreen('register')} />
    );
}

export default function RootNavigator() {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated || !role) {
        return <PublicAuth />;
    }

    const Lobby = LOBBY_BY_ROLE[role] ?? FarmerLobbyScreen;

    return <Lobby />;
}
