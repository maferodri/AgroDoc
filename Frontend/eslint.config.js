/**
 * Documento: ESLint raíz del monorepo frontend.
 * Aplica reglas recomendadas de JavaScript y React Hooks a apps y paquetes,
 * ignorando artefactos de build y resultados de pruebas.
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/storybook-static/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '**/.expo/**',
    '**/graphify-out/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        process: 'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|React)$',
        },
      ],
    },
  },
]);
