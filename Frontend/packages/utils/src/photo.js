/**
 * Documento: validaciones del archivo de foto antes de subirlo.
 * El backend recibe imágenes, así que se descartan archivos demasiado
 * pesados o con formatos que el modelo no procesa.
 */

/** Peso máximo permitido para una foto (5 MB). */
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

/** Tipos MIME aceptados por el diagnóstico. */
export const ALLOWED_PHOTO_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];

/**
 * Valida el peso y el formato de una foto.
 *
 * @param {{ size: number, type: string }} file Archivo o Blob de la foto.
 * @returns {string | null} Mensaje para el usuario o `null` si es válida.
 */
export function validatePhotoFile(file) {
    if (!file || !Number.isFinite(file.size) || file.size >= MAX_PHOTO_SIZE_BYTES) {
        return 'La foto debe pesar menos de 5 MB.';
    }

    const type = file.type?.toLowerCase();

    if (!ALLOWED_PHOTO_TYPES.includes(type)) {
        return 'La foto debe ser JPEG, PNG o WEBP.';
    }

    return null;
}
