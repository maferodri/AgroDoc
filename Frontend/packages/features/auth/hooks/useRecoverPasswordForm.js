/**
 * Documento: formulario de recuperación de contraseña (HU1.3).
 * Valida el correo antes de llamar al backend y expone un mensaje neutro para
 * no revelar si la cuenta existe.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '../api/authApi.js';
import {
    getFieldErrors,
    recoverPasswordSchema,
} from '../schemas/authSchemas.js';

const NEUTRAL_MESSAGE =
    'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';

/** Hook del formulario de recuperación. */
export function useRecoverPasswordForm() {
    const [email, setEmailValue] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const mutation = useMutation({ mutationFn: requestPasswordReset });

    const setEmail = (value) => {
        setEmailValue(value);
        setErrors({});
        setMessage('');
    };

    const submit = () => {
        const result = recoverPasswordSchema.safeParse({ email });

        if (!result.success) {
            setErrors(getFieldErrors(result.error));
            return;
        }

        setErrors({});
        mutation.mutate(result.data, {
            onSuccess: () => setMessage(NEUTRAL_MESSAGE),
            onError: (error) =>
                setMessage(error?.message || 'No se pudo enviar el correo.'),
        });
    };

    return {
        email,
        errors,
        message,
        loading: mutation.isPending,
        setEmail,
        submit,
    };
}
