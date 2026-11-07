/**
 * Documento: estado y validación del formulario de registro (HU1.2).
 * Centraliza campos controlados, validación con Zod, confirmación de la
 * contraseña y envío al backend para las pantallas web y móvil.
 */
import { useState } from 'react';
import { getFieldErrors, registerRequestSchema } from '../schemas/authSchemas.js';
import { useRegister } from './useRegister.js';

/** Mensaje cuando el backend rechaza el correo por estar ya registrado (HTTP 409). */
const EMAIL_TAKEN_MESSAGE = 'Ya existe una cuenta con este correo.';

/** La ayuda del campo exige al menos un número además de los 8 caracteres. */
const PASSWORD_NUMBER_MESSAGE = 'La contraseña debe incluir al menos un número.';

const PASSWORD_MISMATCH_MESSAGE = 'Las contraseñas no coinciden.';

/**
 * @returns {{
 *   fullName: string,
 *   email: string,
 *   password: string,
 *   confirmPassword: string,
 *   consentAccepted: boolean,
 *   errors: Record<string, string>,
 *   error: string,
 *   loading: boolean,
 *   setFullName: (value: string) => void,
 *   setEmail: (value: string) => void,
 *   setPassword: (value: string) => void,
 *   setConfirmPassword: (value: string) => void,
 *   setConsentAccepted: (value: boolean) => void,
 *   submit: () => void,
 * }}
 */
export function useRegisterForm() {
    const [fullName, setFullNameValue] = useState('');
    const [email, setEmailValue] = useState('');
    const [password, setPasswordValue] = useState('');
    const [confirmPassword, setConfirmPasswordValue] = useState('');
    // El consentimiento es opcional y aún no viaja en el contrato del backend.
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const register = useRegister();

    /** Limpia solo el error del campo que el usuario está corrigiendo. */
    const clearFieldError = (field) =>
        setErrors((current) => ({ ...current, [field]: undefined }));

    /** Actualiza un campo, limpia su error y el error general del backend. */
    const updateField = (field, setter, value) => {
        setter(value);
        clearFieldError(field);
        setError('');
    };

    const setFullName = (value) =>
        updateField('fullName', setFullNameValue, value);
    const setEmail = (value) => updateField('email', setEmailValue, value);
    const setPassword = (value) =>
        updateField('password', setPasswordValue, value);
    const setConfirmPassword = (value) =>
        updateField('confirmPassword', setConfirmPasswordValue, value);

    /** Valida en cliente y, si es correcto, delega el envío a `useRegister`. */
    const submit = () => {
        const result = registerRequestSchema.safeParse({
            full_name: fullName,
            email,
            password,
        });
        const fieldErrors = result.success
            ? {}
            : getFieldErrors(result.error);

        // El esquema usa `full_name`; el formulario expone `fullName`.
        if (fieldErrors.full_name) {
            fieldErrors.fullName = fieldErrors.full_name;
            delete fieldErrors.full_name;
        }

        if (result.success && !/\d/.test(password)) {
            fieldErrors.password = PASSWORD_NUMBER_MESSAGE;
        }

        if (confirmPassword !== password) {
            fieldErrors.confirmPassword = PASSWORD_MISMATCH_MESSAGE;
        }

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setError('');
        register.mutate(result.data, {
            onError: (mutationError) => {
                setError(
                    mutationError?.status === 409
                        ? EMAIL_TAKEN_MESSAGE
                        : mutationError?.message ||
                              'No se pudo crear la cuenta.'
                );
            },
        });
    };

    return {
        fullName,
        email,
        password,
        confirmPassword,
        consentAccepted,
        errors,
        error,
        loading: register.isPending,
        setFullName,
        setEmail,
        setPassword,
        setConfirmPassword,
        setConsentAccepted,
        submit,
    };
}
