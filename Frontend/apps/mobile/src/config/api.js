/* global __DEV__ */
/**
 * Documento: resuelve la URL base del backend para la app móvil.
 *
 * Prioridad:
 * 1. `EXPO_PUBLIC_API_URL`: override explícito para desarrollo, túneles,
 *    dispositivos en otra red y builds de producción.
 * 2. En desarrollo, el host de Metro (`Constants.expoConfig.hostUri`). Es la
 *    misma IP que el teléfono ya está usando para cargar el bundle, así que
 *    apuntar al puerto 8000 funciona sin configurar nada al cambiar de Wi-Fi.
 * 3. `localhost`: simulador iOS y emulador Android sin `adb reverse`.
 *
 * En producción no hay `hostUri`, por lo que `EXPO_PUBLIC_API_URL` es
 * obligatoria: se falla al arrancar antes de enviar peticiones a localhost.
 */
import Constants from 'expo-constants';

import { setApiBaseUrl } from '@agrodoc/api';

const API_PORT = 8000;
const API_PATH = '/api/v1';
const LOCAL_HOST = 'localhost';

/** Quita espacios y barras finales para concatenar rutas sin duplicarlas. */
function normalizeUrl(url) {
  return String(url).trim().replace(/\/+$/, '');
}

/**
 * Extrae el host de `hostUri`, que Metro entrega como `host:puerto`.
 * Devuelve `null` si el valor no se puede interpretar.
 */
function hostFromHostUri(hostUri) {
  const value = String(hostUri ?? '').trim();

  // Los literales IPv6 vienen entre corchetes: [fe80::1]:8081.
  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    return end > 0 ? value.slice(0, end + 1) : null;
  }

  const host = value.split(':')[0].trim();

  return host || null;
}

/** Los túneles (`*.exp.direct`) solo publican Metro, no el puerto del API. */
function isTunnelHost(host) {
  return host.endsWith('.exp.direct');
}

/**
 * Calcula la URL base según el entorno y la configuración disponible.
 *
 * @param {object} [options]
 * @param {string} [options.explicitUrl] Override; por defecto `EXPO_PUBLIC_API_URL`.
 * @param {string} [options.hostUri] Host de Metro; por defecto el de Expo.
 * @param {boolean} [options.isDev] Entorno; por defecto `__DEV__`.
 * @returns {string} URL base sin barra final.
 */
export function resolveApiBaseUrl({
  explicitUrl = process.env.EXPO_PUBLIC_API_URL,
  hostUri = Constants.expoConfig?.hostUri,
  isDev = __DEV__,
} = {}) {
  const override = explicitUrl?.trim();

  if (override) {
    return normalizeUrl(override);
  }

  if (!isDev) {
    throw new Error(
      'EXPO_PUBLIC_API_URL no está definida. Configúrala con la URL pública del backend antes de compilar en producción.',
    );
  }

  const host = hostFromHostUri(hostUri);

  if (host && !isTunnelHost(host)) {
    return `http://${host}:${API_PORT}${API_PATH}`;
  }

  if (host) {
    console.warn(
      `[api] El modo túnel de Metro (${host}) no expone el backend. Define EXPO_PUBLIC_API_URL para usar la app en el teléfono.`,
    );
  }

  return `http://${LOCAL_HOST}:${API_PORT}${API_PATH}`;
}

/**
 * Aplica la URL resuelta al cliente HTTP compartido. Se llama una vez en el
 * arranque de la app, antes de renderizar cualquier pantalla.
 *
 * @returns {string} URL base aplicada.
 */
export function configureApiBaseUrl() {
  const url = resolveApiBaseUrl();
  setApiBaseUrl(url);

  if (__DEV__) {
    console.log(`[api] Backend: ${url}`);
  }

  return url;
}
