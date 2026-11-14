/**
 * Documento: servicios de suscripciones.
 * Consulta el plan vigente y registra pagos validados con Zod.
 */
import { request } from '@agrodoc/api';
import { paymentResponseSchema, paymentSchema } from '../schemas/paymentSchemas.js';
import { subscriptionSchema } from '../schemas/subscriptionSchemas.js';

/**
 * Obtiene la suscripción del usuario autenticado.
 *
 * @param {{ accessToken: string, signal?: AbortSignal }} options Sesión.
 * @returns {Promise<object>} Suscripción validada.
 */
export async function getSubscription({ accessToken, signal } = {}) {
    const response = await request('/subscriptions/me', {
        token: accessToken,
        signal,
    });

    return subscriptionSchema.parse(response);
}

/**
 * Registra el pago de un plan.
 *
 * @param {object} input Monto, moneda y método.
 * @param {{ accessToken: string }} [options] Sesión.
 * @returns {Promise<object>} Pago validado.
 */
export async function createPayment(input, { accessToken } = {}) {
    const body = paymentSchema.parse(input);
    const response = await request('/payments', {
        method: 'POST',
        body,
        token: accessToken,
    });

    return paymentResponseSchema.parse(response);
}
