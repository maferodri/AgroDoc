/**
 * Documento: punto de entrada de la app móvil.
 * Registra el componente raíz con Expo para Expo Go y builds nativos.
 */
import { registerRootComponent } from 'expo';

import App from './App';
import { configureApiBaseUrl } from './src/config/api';

// Fija el backend antes de montar la app: en desarrollo usa la IP de Metro y en
// producción la URL de EXPO_PUBLIC_API_URL.
configureApiBaseUrl();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
