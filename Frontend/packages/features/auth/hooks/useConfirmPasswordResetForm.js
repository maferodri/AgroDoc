/**
 * Documento: paso 2 de la recuperación de contraseña (HU1.3).
 * Valida código y contraseña, verifica el código contra el backend y confirma
 * el cambio con el token de un solo uso que devuelve la verificación.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    confirmPasswordReset,
    verifyPasswordResetCode,
} from '../api/authApi.js';
import {
    getFieldErrors,
    passwordResetConfirmFormSchema,
} from '../schemas/authSchemas.js';

/** La ayuda del campo exige al menos un número además de los 8 caracteres. */
const PASSWORD_NUMBER_MESSAGE = 'La contraseña debe incluir al menos un número.';

const INVALID_CODE_MESSAGE = 'El código es inválido o expiró. Solicita uno nuevo.';

const EXPIRED_LINK_MESSAGE =
    'El enlace de recuperación expiró. Solicita un código nuevo.';

/**
 * @param {{ email?: string, onSuccess?: () => void }} [options]
 *   Correo del paso 1 y callback cuando la contraseña se actualiza.
 * @returns {{
 *   code: string,
 *   newPassword: string,
 *   confirmPassword: string,
 *   errors: Record<string, string>,
 *   error: string,
 *   loading: boolean,
 *   setCode: (value: string) => void,
 *   setNewPassword: (value: string) => void,
 *   setConfirmPassword: (value: string) => void,
 *   reset: () => void,
 *   submit: () => void,
 * }}
 */
export function useConfirmPasswordResetForm({ email, onSuccess } = {}) {
    const [code, setCodeValue] = useState('');
    const [newPassword, setNewPasswordValue] = useState('');
    const [confirmPassword, setConfirmPasswordValue] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    // El código ya verificado no puede verificarse otra vez; el token se
    // conserva para reintentar el confirm si falla la red.
    const [resetToken, setResetToken] = useState('');

    const verify = useMutation({ mutationFn: verifyPasswordResetCode });
    const confirm = useMutation({ mutationFn: confirmPasswordReset });

    /** Limpia solo el error del campo que el usuario está corrigiendo. */
    const clearFieldError = (field) =>
        setErrors((current) => ({ ...current, [field]: undefined }));

    const updateField = (field, setter, value) => {
        setter(value);
        clearFieldError(field);
        setError('');
    };

    const setCode = (value) => updateField('code', setCodeValue, value);
    const setNewPassword = (value) =>
        updateField('newPassword', setNewPasswordValue, value);
    const setConfirmPassword = (value) =>
        updateField('confirmPassword', setConfirmPasswordValue, value);

    const handleConfirmError = (mutationError) => {
        // Un token inválido o expirado obliga a pedir un código nuevo.
        if (mutationError?.code === 'invalid_reset_token') {
            setResetToken('');
            setError(EXPIRED_LINK_MESSAGE);
            return;
        }

        setError(
            mutationError?.message || 'No se pudo restablecer la contraseña.'
        );
    };

    const sendConfirmation = (token) => {
        confirm.mutate(
            { reset_token: token, new_password: newPassword },
            { onSuccess: () => onSuccess?.(), onError: handleConfirmError }
        );
    };

    /** Valida en cliente y encadena verificación y confirmación. */
    const submit = () => {
        const result = passwordResetConfirmFormSchema.safeParse({
            code,
            new_password: newPassword,
            confirm_password: confirmPassword,
        });
        const fieldErrors = result.success
            ? {}
            : getFieldErrors(result.error);

        if (result.success && !/\d/.test(newPassword)) {
            fieldErrors.new_password = PASSWORD_NUMBER_MESSAGE;
        }

        // El esquema usa snake_case; el formulario expone camelCase.
        if (Object.keys(fieldErrors).length > 0) {
            setErrors({
                code: fieldErrors.code,
                newPassword: fieldErrors.new_password,
                confirmPassword: fieldErrors.confirm_password,
            });
            return;
        }

        if (!email) {
            setError('Solicita un código antes de continuar.');
            return;
        }

        setErrors({});
        setError('');

        if (resetToken) {
            sendConfirmation(resetToken);
            return;
        }

        verify.mutate(
            { email, code: result.data.code },
            {
                onSuccess: ({ reset_token }) => {
                    setResetToken(reset_token);
                    sendConfirmation(reset_token);
                },
                onError: (mutationError) => {
                    if (mutationError?.code === 'invalid_reset_code') {
                        setErrors({ code: INVALID_CODE_MESSAGE });
                        return;
                    }

                    setError(
                        mutationError?.message ||
                            'No se pudo validar el código.'
                    );
                },
            }
        );
    };

    /** Descarta el token y los errores al pedir un código nuevo. */
    const reset = () => {
        setResetToken('');
        setErrors({});
        setError('');
    };

    return {
        code,
        newPassword,
        confirmPassword,
        errors,
        error,
        loading: verify.isPending || confirm.isPending,
        setCode,
        setNewPassword,
        setConfirmPassword,
        reset,
        submit,
    };
}
