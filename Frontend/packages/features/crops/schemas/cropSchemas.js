/**
 * Documento: esquemas del feature de cultivos.
 * Validan los datos mínimos para registrar un lote antes de llamar al backend.
 */
import { z } from 'zod';

/** Cultivo registrado por el agricultor. */
export const cropSchema = z.object({
    lote: z.string().trim().min(1, 'Ingresa el nombre del lote.'),
    variedad: z.string().trim().min(1, 'Selecciona la variedad del cultivo.'),
    ubicacion: z.string().trim().min(1, 'Ingresa la ubicación del cultivo.'),
});

/** Respuesta del backend al crear o consultar un cultivo. */
export const cropResponseSchema = cropSchema.extend({
    id: z.uuid(),
    created_at: z.string().min(1),
});
