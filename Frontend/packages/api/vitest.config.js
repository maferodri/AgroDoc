/**
 * Documento: configuración de Vitest para @agrodoc/api.
 * Prueba el cliente HTTP y los handlers MSW en Node.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
