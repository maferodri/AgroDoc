/**
 * Documento: API pública de @agrodoc/utils.
 * Utilidades puras compartidas por web, móvil y los features.
 */
export {
    CONFIDENCE_HIGH_THRESHOLD,
    CONFIDENCE_MEDIUM_THRESHOLD,
    formatConfidence,
    getConfidenceLevel,
    requiresAgronomist,
} from './src/confidence.js';
export {
    ALLOWED_PHOTO_TYPES,
    MAX_PHOTO_SIZE_BYTES,
    validatePhotoFile,
} from './src/photo.js';
