/**
 * Documento: configuración de Vite para la app web.
 * Aliasa React Native a React Native Web y resuelve react-native-svg en su build web.
 */
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)

// `react-native-svg` no trae un campo `exports` con condición browser, así que
// Vite resuelve su entry nativo (fabric). Apuntamos directo a la implementación web.
const reactNativeSvgWeb = path.join(
  path.dirname(require.resolve('react-native-svg/package.json')),
  'lib/module/ReactNativeSVG.web.js',
)

// `react-native-svg@15.16` requiere este módulo nativo (solo Android) que
// `react-native-web` no puede resolver. En web nunca se ejecuta.
const reactNativeSvgSoundShim = fileURLToPath(
  new URL('./shims/react-native-svg-sound.js', import.meta.url),
)

// Intercepta la importación relativa dentro de react-native-svg en Vite 8 (Rolldown)
const nativeSvgSoundPlugin = {
  name: 'shim-native-svg-sound',
  enforce: 'pre',
  resolveId(source) {
    if (/(?:^|\/)fabric\/NativeSvgSoundModule(?:\.js)?$/.test(source)) {
      return reactNativeSvgSoundShim
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [nativeSvgSoundPlugin, react()],
  // El optimizer de Vite 8 no usa `resolve.extensions`; hay que declararlas
  // en su propio resolver para que se elijan los archivos `.web.js`.
  optimizeDeps: {
    rolldownOptions: {
      plugins: [nativeSvgSoundPlugin],
      resolve: {
        alias: optimizeDepsAlias,
        extensions: [
          '.web.jsx',
          '.web.js',
          '.tsx',
          '.ts',
          '.jsx',
          '.js',
          '.css',
          '.json',
        ],
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /(?:^|\/)fabric\/NativeSvgSoundModule(?:\.js)?$/,
        replacement: reactNativeSvgSoundShim,
      },
      {
        find: /^@react-native\/assets-registry\/registry$/,
        replacement: 'react-native-web/asset-registry',
      },
      { find: /^react-native-svg$/, replacement: reactNativeSvgWeb },
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
})