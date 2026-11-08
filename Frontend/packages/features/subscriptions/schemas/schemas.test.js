/**
 * Documento: pruebas de esquemas de cultivo y pago.
 * Verifican que los campos obligatorios y los montos inválidos no lleguen al
 * backend.
 */
import { describe, expect, it } from 'vitest';
import { cropSchema } from '../../crops/schemas/cropSchemas.js';
import { getFieldErrors } from '../../auth/schemas/authSchemas.js';
import { paymentSchema } from '../schemas/paymentSchemas.js';

describe('cropSchema', () => {
    it('acepta lote, variedad y ubicación', () => {
        expect(
            cropSchema.safeParse({
                lote: 'Lote Norte',
                variedad: 'Maíz blanco',
                ubicacion: 'Valle de Santiago',
            }).success
        ).toBe(true);
    });

    it('exige los tres campos obligatorios', () => {
        const result = cropSchema.safeParse({
            lote: '',
            variedad: '',
            ubicacion: '',
        });

        expect(result.success).toBe(false);
        expect(getFieldErrors(result.error)).toMatchObject({
            lote: expect.any(String),
            variedad: expect.any(String),
            ubicacion: expect.any(String),
        });
    });
});

describe('paymentSchema', () => {
    it('acepta un pago válido', () => {
        expect(
            paymentSchema.safeParse({
                amount: 199,
                currency: 'MXN',
                method: 'card',
            }).success
        ).toBe(true);
    });

    it('rechaza montos no positivos y monedas desconocidas', () => {
        expect(
            paymentSchema.safeParse({
                amount: 0,
                currency: 'MXN',
                method: 'card',
            }).success
        ).toBe(false);

        expect(
            paymentSchema.safeParse({
                amount: 99,
                currency: 'EUR',
                method: 'card',
            }).success
        ).toBe(false);
    });
});
