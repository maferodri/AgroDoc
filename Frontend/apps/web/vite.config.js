import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.jsx', '.web.js', '.jsx', '.js', '.json'],
  },
})
