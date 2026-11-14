/**
 * Documento: configuración de Vitest para la app web.
 * Reutiliza los alias de React Native Web que usa Vite en desarrollo.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const reactNativeSvgWeb = path.join(
  path.dirname(require.resolve('react-native-svg/package.json')),
  'lib/module/ReactNativeSVG.web.js'
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@react-native\/assets-registry\/registry$/,
        replacement: 'react-native-web/asset-registry',
      },
      { find: /^react-native-svg$/, replacement: reactNativeSvgWeb },
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
