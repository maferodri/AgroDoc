/**
 * Documento: pruebas de la validación del archivo de foto.
 * Cubren el límite de 5 MB y los formatos aceptados.
 */
import { describe, expect, it } from 'vitest';
import {
    ALLOWED_PHOTO_TYPES,
    MAX_PHOTO_SIZE_BYTES,
    validatePhotoFile,
} from './photo.js';

describe('validatePhotoFile', () => {
    it('acepta JPEG, PNG y WEBP por debajo del límite', () => {
        ALLOWED_PHOTO_TYPES.forEach((type) => {
            expect(
                validatePhotoFile({ size: MAX_PHOTO_SIZE_BYTES - 1, type })
            ).toBeNull();
        });
    });

    it('rechaza archivos de 5 MB o más', () => {
        expect(
            validatePhotoFile({
                size: MAX_PHOTO_SIZE_BYTES,
                type: 'image/jpeg',
            })
        ).toBe('La foto debe pesar menos de 5 MB.');
    });

    it('rechaza formatos no permitidos', () => {
        expect(
            validatePhotoFile({ size: 1024, type: 'image/gif' })
        ).toBe('La foto debe ser JPEG, PNG o WEBP.');
    });

    it('rechaza archivos sin tamaño legible', () => {
        expect(
            validatePhotoFile({ size: undefined, type: 'image/jpeg' })
        ).toBe('La foto debe pesar menos de 5 MB.');
    });
});
