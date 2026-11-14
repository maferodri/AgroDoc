/**
 * Documento: preparación de pruebas de @agrodoc/ui.
 * Agrega los matchers de jest-dom y limpia el DOM entre casos.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
    cleanup();
});
