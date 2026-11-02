/**
 * Documento: navegación raíz de la app móvil.
 * Decide entre el login y el lobby del rol con la sesión del feature auth.
 */
import { useAuth } from '@agrodoc/features';
import AdminLobbyScreen from '../screens/admin/AdminLobbyScreen';
import AgronomistLobbyScreen from '../screens/agronomist/AgronomistLobbyScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import FarmerLobbyScreen from '../screens/farmer/FarmerLobbyScreen';

/** Lobby que corresponde a cada rol del backend. */
const LOBBY_BY_ROLE = {
    farmer: FarmerLobbyScreen,
    agronomist: AgronomistLobbyScreen,
    admin: AdminLobbyScreen,
};

export default function RootNavigator() {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated || !role) {
        return <LoginScreen />;
    }

    const Lobby = LOBBY_BY_ROLE[role] ?? FarmerLobbyScreen;

    return <Lobby />;
}
