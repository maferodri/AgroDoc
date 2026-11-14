/**
 * Documento: esquemas del feature de diagnóstico.
 * Describen el resultado del modelo y las consultas que se crean cuando la
 * confianza es baja y el agricultor necesita un agrónomo.
 */
import { z } from 'zod';

/** Resultado del análisis de una foto de cultivo. */
export const diagnosisSchema = z.object({
    id: z.uuid(),
    disease_name: z.string().min(1),
    description: z.string(),
    confidence: z.number().min(0).max(100),
    requires_agronomist: z.boolean(),
    recommendations: z.array(z.string()),
    image_url: z.string().optional(),
    created_at: z.string().min(1),
});

/** Datos que se envían para analizar una foto. */
export const diagnosisRequestSchema = z.object({
    image: z.string().min(1, 'Selecciona una foto para analizar.'),
    crop_id: z.uuid().optional(),
});

/** Consulta enviada a un agrónomo desde un diagnóstico. */
export const consultationSchema = z.object({
    id: z.uuid(),
    farmer_name: z.string(),
    image_url: z.string(),
    status: z.enum(['pending', 'answered', 'closed']),
    diagnosis: z.object({
        disease_name: z.string(),
        confidence: z.number().min(0).max(100),
    }),
    created_at: z.string().min(1),
});

export const consultationListSchema = z.array(consultationSchema);

/** Cuerpo de `POST /consultations`. */
export const createConsultationSchema = z.object({
    diagnosis_id: z.uuid(),
    message: z.string().optional(),
});
