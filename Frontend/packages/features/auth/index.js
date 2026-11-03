/**
 * Documento: API pública del feature auth (Épica 1).
 * Las apps y el router consumen solo estos exports: servicios, hooks,
 * esquemas, store y el guard por rol.
 */
export {
    getMyProfile,
    listAgronomists,
    loginUser,
    logoutUser,
    refreshSession,
    registerUser,
} from './api/authApi.js';

export {
    REGISTER_ROLES,
    USER_ROLES,
    agronomistListSchema,
    agronomistProfileSchema,
    agronomistUserSchema,
    authResponseSchema,
    errorResponseSchema,
    getFieldErrors,
    loginRequestSchema,
    refreshTokenSchema,
    registerRequestSchema,
    userSchema,
} from './schemas/authSchemas.js';

export {
    authKeys,
} from './hooks/queryKeys.js';
export { useCurrentUser } from './hooks/useCurrentUser.js';
export { useLogin } from './hooks/useLogin.js';
export { useLoginForm } from './hooks/useLoginForm.js';
export { useLogout } from './hooks/useLogout.js';
export { useRefreshSession } from './hooks/useRefreshSession.js';
export { useRegister } from './hooks/useRegister.js';
export { useRegisterForm } from './hooks/useRegisterForm.js';
export { useAuth, useHasRole, useRole } from './hooks/useRole.js';

export {
    selectIsAuthenticated,
    selectRole,
    useAuthStore,
} from './store/authStore.js';

export { RoleGuard } from './components/RoleGuard.jsx';
