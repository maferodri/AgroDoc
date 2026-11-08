/**
 * Documento: esquema de suscripción.
 * El plan básico incluye el diagnóstico simple; `premium` desbloquea el resto.
 */
import { z } from 'zod';

export const subscriptionSchema = z.object({
    plan: z.enum(['basic', 'premium']),
    status: z.enum(['active', 'inactive', 'past_due']),
    features: z.object({
        basic_diagnosis: z.boolean(),
        consultations: z.boolean(),
    }),
});

/**
 * Indica si la suscripción permite usar el diagnóstico básico.
 *
 * @param {object|null} subscription Suscripción validada.
 * @returns {boolean} `true` para planes activos con diagnóstico básico.
 */
export function canAccessBasicDiagnosis(subscription) {
    return Boolean(
        subscription &&
            subscription.status === 'active' &&
            subscription.features?.basic_diagnosis
    );
}
