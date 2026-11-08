/**
 * Documento: configuración de Vitest para @agrodoc/features.
 * Usa jsdom y resuelve React Native a React Native Web para poder renderizar
 * los componentes de resultado en las pruebas.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const reactNativeSvgWeb = path.join(
  path.dirname(require.resolve('react-native-svg/package.json')),
  'lib/module/ReactNativeSVG.web.js'
);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^react-native-svg$/, replacement: reactNativeSvgWeb },
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['**/*.test.{js,jsx}'],
    exclude: ['node_modules/**'],
  },
});
