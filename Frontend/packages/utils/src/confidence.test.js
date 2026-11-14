/**
 * Documento: pruebas de las utilidades de confianza.
 * Garantizan que la interfaz muestre enteros y que el umbral derive
 * correctamente a un agrónomo.
 */
import { describe, expect, it } from 'vitest';
import {
    CONFIDENCE_HIGH_THRESHOLD,
    CONFIDENCE_MEDIUM_THRESHOLD,
    formatConfidence,
    getConfidenceLevel,
    requiresAgronomist,
} from '../src/confidence.js';

describe('formatConfidence', () => {
    it('redondea a entero sin decimales', () => {
        expect(formatConfidence(92.8)).toBe('93%');
        expect(formatConfidence(64.2)).toBe('64%');
        expect(formatConfidence('34.7')).toBe('35%');
    });

    it('devuelve 0% para valores inválidos', () => {
        expect(formatConfidence(null)).toBe('0%');
        expect(formatConfidence('no-es-numero')).toBe('0%');
    });
});

describe('getConfidenceLevel', () => {
    it('usa los umbrales alto, medio y bajo', () => {
        expect(getConfidenceLevel(CONFIDENCE_HIGH_THRESHOLD)).toBe('high');
        expect(getConfidenceLevel(CONFIDENCE_HIGH_THRESHOLD - 1)).toBe('medium');
        expect(getConfidenceLevel(CONFIDENCE_MEDIUM_THRESHOLD)).toBe('medium');
        expect(getConfidenceLevel(CONFIDENCE_MEDIUM_THRESHOLD - 1)).toBe('low');
    });
});

describe('requiresAgronomist', () => {
    it('deriva a un agrónomo solo con confianza baja', () => {
        expect(requiresAgronomist(95)).toBe(false);
        expect(requiresAgronomist(65)).toBe(false);
        expect(requiresAgronomist(35)).toBe(true);
    });
});
