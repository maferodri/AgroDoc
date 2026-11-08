/**
 * Documento: esquemas de validación del feature auth.
 * Reflejan los contratos de `openapi-agrodoc.yaml` (sección AUTH) y se usan
 * tanto en formularios como al validar las respuestas del backend.
 */
import { z } from 'zod';

/** Roles válidos del sistema; el administrador solo existe en la app web. */
export const USER_ROLES = ['farmer', 'agronomist', 'admin'];

/** Roles que un usuario puede elegir al registrarse desde la app. */
export const REGISTER_ROLES = ['farmer', 'agronomist'];

export const roleSchema = z.enum(USER_ROLES);
export const registerRoleSchema = z.enum(REGISTER_ROLES);

/** Usuario autenticado tal como lo devuelve `/users/me` y `AuthResponse`. */
export const userSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    full_name: z.string().min(1),
    role: roleSchema,
    is_active: z.boolean(),
    // El backend puede devolver la fecha sin zona horaria; no se restringe el formato.
    created_at: z.string().min(1),
});

/** Perfil profesional del agrónomo. */
export const agronomistProfileSchema = z.object({
    user_id: z.uuid(),
    specialty: z.string(),
    license_number: z.string(),
    is_available: z.boolean(),
});

/** Agrónomo con su perfil, usado en `/agronomists`. */
export const agronomistUserSchema = userSchema.extend({
    profile: agronomistProfileSchema.nullable().optional(),
});

export const agronomistListSchema = z.array(agronomistUserSchema);

/** Datos del formulario de inicio de sesión (HU1.1). */
export const loginRequestSchema = z.object({
    email: z.email('Ingresa un correo válido.'),
    password: z.string().min(1, 'Ingresa tu contraseña.'),
});

/** Datos del formulario de registro (HU1.2). */
export const registerRequestSchema = z.object({
    email: z.email('Ingresa un correo válido.'),
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    full_name: z.string().trim().min(1, 'Ingresa tu nombre completo.'),
});

/**
 * Formulario completo de registro: agrega la confirmación de contraseña.
 * La validación cruzada vive en el esquema para que web y móvil compartan
 * exactamente el mismo mensaje de error.
 */
export const registerFormSchema = registerRequestSchema
    .extend({
        confirm_password: z
            .string()
            .min(1, 'Confirma tu contraseña.'),
    })
    .refine((data) => data.password === data.confirm_password, {
        path: ['confirm_password'],
        message: 'Las contraseñas no coinciden.',
    });

/** Cuerpo del formulario de recuperación de contraseña. */
export const recoverPasswordSchema = z.object({
    email: z.email('Ingresa un correo válido.'),
});


/** Cuerpo de `/auth/refresh` y `/auth/logout`. */
export const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1),
});

/** Respuesta de login, registro y refresh. */
export const authResponseSchema = z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    token_type: z.string().default('Bearer'),
    user: userSchema,
});

/** Sesión persistida localmente para restaurar el usuario al recargar. */
export const storedSessionSchema = authResponseSchema.pick({
    access_token: true,
    refresh_token: true,
    user: true,
});

/** Error estándar del contrato (`ErrorResponse`). */
export const errorResponseSchema = z.object({
    error: z.string(),
    message: z.string(),
});

/**
 * Traduce los issues de Zod a un objeto `{ campo: mensaje }` para pintar
 * errores por campo en los formularios de la app.
 *
 * @param {import('zod').ZodError} error Error lanzado por `safeParse`/`parse`.
 * @returns {Record<string, string>} Primer mensaje de error por campo.
 */
export function getFieldErrors(error) {
    const fieldErrors = {};

    for (const issue of error?.issues ?? []) {
        const field = issue.path?.[0];
        if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.message;
        }
    }

    return fieldErrors;
}
