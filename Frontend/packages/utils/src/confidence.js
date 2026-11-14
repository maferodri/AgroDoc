/**
 * Documento: utilidades de confianza del diagnóstico.
 * El backend devuelve un porcentaje con decimales; la interfaz siempre muestra
 * un entero y decide si el resultado es confiable o requiere un agrónomo.
 */

/** Umbral mínimo para considerar un diagnóstico confiable. */
export const CONFIDENCE_HIGH_THRESHOLD = 80;

/** Umbral mínimo para un resultado medio (por debajo pasa a bajo). */
export const CONFIDENCE_MEDIUM_THRESHOLD = 50;

/**
 * Formatea un porcentaje de confianza como entero sin decimales.
 *
 * @param {number|string} value Porcentaje devuelto por el backend.
 * @returns {string} Porcentaje redondeado con el símbolo `%`.
 */
export function formatConfidence(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
        return '0%';
    }

    return `${Math.round(numeric)}%`;
}

/**
 * Clasifica la confianza en `high`, `medium` o `low`.
 * Estos niveles alimentan el color de `ConfidenceBar` y la derivación a un
 * agrónomo cuando el resultado no es fiable.
 *
 * @param {number|string} value Porcentaje de confianza.
 * @returns {'high'|'medium'|'low'} Nivel calculado.
 */
export function getConfidenceLevel(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric) || numeric < CONFIDENCE_MEDIUM_THRESHOLD) {
        return 'low';
    }

    if (numeric < CONFIDENCE_HIGH_THRESHOLD) {
        return 'medium';
    }

    return 'high';
}

/**
 * Indica si el diagnóstico debe derivarse a un agrónomo.
 *
 * @param {number|string} value Porcentaje de confianza.
 * @returns {boolean} `true` cuando la confianza es baja.
 */
export function requiresAgronomist(value) {
    return getConfidenceLevel(value) === 'low';
}
