/**
 * Documento: configuración de Vitest para @agrodoc/utils.
 * Solo se prueban funciones puras, por lo que el entorno es Node.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
