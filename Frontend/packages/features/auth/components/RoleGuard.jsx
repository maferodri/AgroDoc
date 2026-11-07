/**
 * Documento: guard de acceso por rol.
 * Renderiza los hijos solo si el rol de la sesión está permitido; en caso
 * contrario devuelve el fallback recibido (el router decide a dónde ir).
 */
import { useRole } from '../hooks/useRole.js';

/**
 * @param {object} props
 * @param {string|string[]} props.roles Roles autorizados (`farmer`, `agronomist`, `admin`).
 * @param {React.ReactNode} [props.fallback] Contenido alternativo si no hay permiso.
 * @param {React.ReactNode} props.children Contenido protegido.
 */
export function RoleGuard({ roles, fallback = null, children }) {
    const role = useRole();
    const allowed = Array.isArray(roles) ? roles : [roles];

    if (!role || !allowed.includes(role)) {
        return fallback;
    }

    return children;
}
