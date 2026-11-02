/**
 * Documento: estado y validación del formulario de inicio de sesión (HU1.1).
 * Centraliza la lógica que comparten la pantalla web y la móvil: campos
 * controlados, validación con Zod, errores por campo y envío al backend.
 */
import { useState } from 'react';
import { getFieldErrors, loginRequestSchema } from '../schemas/authSchemas.js';
import { useLogin } from './useLogin.js';

/** Mensaje único para credenciales rechazadas por el backend (HTTP 401). */
const INVALID_CREDENTIALS_MESSAGE = 'Usuario o contraseña incorrectos.';

/**
 * @param {{ onSuccess?: (session: object) => void }} [options]
 *   Callback opcional cuando el backend devuelve una sesión válida.
 * @returns {{
 *   email: string,
 *   password: string,
 *   errors: Record<string, string>,
 *   error: string,
 *   loading: boolean,
 *   setEmail: (value: string) => void,
 *   setPassword: (value: string) => void,
 *   submit: () => void,
 * }}
 */
export function useLoginForm({ onSuccess } = {}) {
    const [email, setEmailValue] = useState('');
    const [password, setPasswordValue] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const login = useLogin();

    /** Limpia solo el error del campo que el usuario está corrigiendo. */
    const clearFieldError = (field) =>
        setErrors((current) => ({ ...current, [field]: undefined }));

    const setEmail = (value) => {
        setEmailValue(value);
        clearFieldError('email');
        setError('');
    };

    const setPassword = (value) => {
        setPasswordValue(value);
        clearFieldError('password');
        setError('');
    };

    /** Valida en cliente y, si es correcto, delega el envío a `useLogin`. */
    const submit = () => {
        const result = loginRequestSchema.safeParse({ email, password });

        if (!result.success) {
            setErrors(getFieldErrors(result.error));
            return;
        }

        setErrors({});
        setError('');
        login.mutate(result.data, {
            onSuccess: (session) => onSuccess?.(session),
            onError: (mutationError) => {
                // El backend responde 401 cuando el correo o la contraseña no
                // coinciden; se muestra un mensaje claro y sin detalles internos.
                setError(
                    mutationError?.status === 401 ||
                        mutationError?.isUnauthorized
                        ? INVALID_CREDENTIALS_MESSAGE
                        : mutationError?.message ||
                              'No se pudo iniciar sesión.'
                );
            },
        });
    };

    return {
        email,
        password,
        errors,
        error,
        loading: login.isPending,
        setEmail,
        setPassword,
        submit,
    };
}
