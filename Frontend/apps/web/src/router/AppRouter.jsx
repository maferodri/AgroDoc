/**
 * Documento: rutas de la app web.
 * Redirige la raíz y el login según la sesión, y registra los lobbies por rol.
 * El Playground solo existe en desarrollo.
 */
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@agrodoc/features';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminLobby from '../pages/admin/AdminLobby';
import AgronomistLobby from '../pages/agronomist/AgronomistLobby';
import FarmerLobby from '../pages/farmer/FarmerLobby';
import Playground from '../pages/Playground';
import { ROUTES, getHomeRoute } from './routes';

/** Lleva al lobby del rol actual o al login si no hay sesión. */
function HomeRedirect() {
    const { isAuthenticated, role } = useAuth();

    return (
        <Navigate
            to={
                isAuthenticated && role
                    ? getHomeRoute(role)
                    : ROUTES.login
            }
            replace
        />
    );
}

/** Evita mostrar el login cuando el usuario ya tiene sesión activa. */
function PublicLogin() {
    const { isAuthenticated, role } = useAuth();

    if (isAuthenticated && role) {
        return <Navigate to={getHomeRoute(role)} replace />;
    }

    return <Login />;
}

/** Evita mostrar el registro cuando el usuario ya tiene sesión activa. */
function PublicRegister() {
    const { isAuthenticated, role } = useAuth();

    if (isAuthenticated && role) {
        return <Navigate to={getHomeRoute(role)} replace />;
    }

    return <Register />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
        <Routes>
            {/* Rutas públicas */}
            <Route path={ROUTES.login} element={<PublicLogin />} />
            <Route path={ROUTES.register} element={<PublicRegister />} />
            <Route path="/" element={<HomeRedirect />} />

            {/* Lobbies por rol */}
            <Route path={ROUTES.farmerLobby} element={<FarmerLobby />} />
            <Route path={ROUTES.agronomistLobby} element={<AgronomistLobby />} />
            <Route path={ROUTES.adminLobby} element={<AdminLobby />} />

            {/* Solo en desarrollo, fuera de ProtectedRoute */}
            {import.meta.env.DEV && (
            <Route path={ROUTES.playground} element={<Playground />} />
            )}

            {/* Rutas privadas (ProtectedRoute) van después */}
        </Routes>
        </BrowserRouter>
    );
}
