/**
 * Documento: servicios del feature de diagnóstico.
 * Envían la foto al backend, validan el resultado y consultan o crean las
 * solicitudes de agrónomo.
 */
import { request } from '@agrodoc/api';
import {
    consultationListSchema,
    consultationSchema,
    createConsultationSchema,
    diagnosisRequestSchema,
    diagnosisSchema,
} from '../schemas/diagnosisSchemas.js';

/**
 * Analiza una foto de cultivo.
 *
 * @param {{ image: string, cropId?: string }} input Referencia de la foto.
 * @param {{ signal?: AbortSignal }} [options] Cancelación.
 * @returns {Promise<object>} Diagnóstico validado.
 */
export async function analyzeDiagnosis({ image, cropId }, { signal } = {}) {
    const body = diagnosisRequestSchema.parse({
        image,
        crop_id: cropId,
    });
    const response = await request('/diagnosis', {
        method: 'POST',
        body,
        signal,
    });

    return diagnosisSchema.parse(response);
}

/**
 * Lista las consultas asignadas o pendientes del agrónomo.
 *
 * @param {{ accessToken: string, signal?: AbortSignal }} options Sesión y cancelación.
 * @returns {Promise<object[]>} Consultas validadas.
 */
export async function listConsultations({ accessToken, signal } = {}) {
    const response = await request('/consultations', {
        token: accessToken,
        signal,
    });

    return consultationListSchema.parse(response);
}

/**
 * Crea una consulta a partir de un diagnóstico de confianza baja.
 *
 * @param {{ diagnosisId: string, message?: string }} input Datos de la consulta.
 * @param {{ accessToken: string }} [options] Sesión del agricultor.
 * @returns {Promise<object>} Consulta creada.
 */
export async function createConsultation(
    { diagnosisId, message },
    { accessToken } = {}
) {
    const body = createConsultationSchema.parse({
        diagnosis_id: diagnosisId,
        message,
    });
    const response = await request('/consultations', {
        method: 'POST',
        body,
        token: accessToken,
    });

    return consultationSchema.parse(response);
}
