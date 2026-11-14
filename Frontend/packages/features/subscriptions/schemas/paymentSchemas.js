/**
 * Documento: esquemas del feature de suscripciones y pagos.
 * El pago se valida antes de enviarse para evitar montos negativos o monedas
 * que el backend no acepta.
 */
import { z } from 'zod';

/** Monedas habilitadas por el contrato de pagos. */
export const PAYMENT_CURRENCIES = ['MXN', 'USD'];

/** Métodos de pago disponibles en la app. */
export const PAYMENT_METHODS = ['card', 'transfer'];

/** Cuerpo de `/payments`. */
export const paymentSchema = z.object({
    amount: z.number().positive('El monto debe ser mayor que cero.'),
    currency: z.enum(PAYMENT_CURRENCIES),
    method: z.enum(PAYMENT_METHODS),
});

/** Respuesta del backend con el estado de la transacción. */
export const paymentResponseSchema = paymentSchema.extend({
    id: z.uuid(),
    status: z.enum(['pending', 'approved', 'rejected']),
});
