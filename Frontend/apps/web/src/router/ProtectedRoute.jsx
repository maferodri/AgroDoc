/**
 * Documento: guard de rutas web.
 * Exige sesión activa y, opcionalmente, un rol permitido. Si el usuario no
 * tiene permiso se le envía a su propio lobby, nunca a una pantalla ajena.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@agrodoc/features';
import { ROUTES, getHomeRoute } from './routes';

/**
 * @param {string[]} [roles] Roles autorizados; si falta, basta con autenticarse.
 * @param {React.ReactNode} children Ruta protegida.
 */
export function ProtectedRoute({ roles, children }) {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated || !role) {
        return <Navigate to={ROUTES.login} replace />;
    }

    if (roles && !roles.includes(role)) {
        return <Navigate to={getHomeRoute(role)} replace />;
    }

    return children;
}
