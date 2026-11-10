/**
 * Documento: cliente HTTP compartido de AgroDoc.
 * Centraliza la URL base, la serialización JSON y la traducción de errores del
 * contrato (`ErrorResponse`) para que los features no repitan esta lógica.
 */

// URL por defecto del monolito local (ver servers del contrato OpenAPI).
// Debe ser un literal: este paquete también se empaqueta para web y móvil,
// donde `process.env` no existe en tiempo de ejecución. Las apps que necesiten
// otra URL llaman a `setApiBaseUrl` al arrancar (la web lo hace en `main.jsx`).
const DEFAULT_BASE_URL = 'http://localhost:8000/api/v1';

let baseUrl = DEFAULT_BASE_URL;

/**
 * Error normalizado de la API.
 * Conserva el status HTTP y el código del contrato para que las pantallas
 * puedan distinguir credenciales inválidas, correo duplicado o red caída.
 */
export class ApiError extends Error {
    constructor(message, { status = 0, code = 'UNKNOWN_ERROR', payload = null, cause } = {}) {
        super(message, { cause });
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.payload = payload;
    }

    /** Indica si el token de acceso falta o expiró. */
    get isUnauthorized() {
        return this.status === 401;
    }

    /** Indica si el recurso ya existe (p. ej. correo ya registrado). */
    get isConflict() {
        return this.status === 409;
    }
}

/**
 * Cambia la URL base usada por todos los servicios.
 * Las apps lo llaman al arrancar si el backend no está en localhost.
 *
 * @param {string} url URL completa, p. ej. `https://api.agrodoc.com/api/v1`.
 */
export function setApiBaseUrl(url) {
    baseUrl = String(url).replace(/\/+$/, '');
}

/** Devuelve la URL base vigente (útil para diagnósticos y pruebas). */
export function getApiBaseUrl() {
    return baseUrl;
}

/**
 * Ejecuta una petición al backend y devuelve el cuerpo ya parseado.
 *
 * @param {string} path Ruta relativa, p. ej. `/auth/login`.
 * @param {object} [options]
 * @param {'GET'|'POST'|'PATCH'|'PUT'|'DELETE'} [options.method] Verbo HTTP.
 * @param {object} [options.body] Cuerpo serializado como JSON.
 * @param {string} [options.token] Token Bearer para endpoints protegidos.
 * @param {AbortSignal} [options.signal] Señal para cancelar la petición.
 * @param {Record<string, string>} [options.headers] Cabeceras adicionales.
 * @returns {Promise<any>} Cuerpo JSON, texto o `null` si no hay contenido.
 */
export async function request(path, { method = 'GET', body, token, signal, headers } = {}) {
    const finalHeaders = { Accept: 'application/json', ...headers };

    if (body !== undefined) {
        finalHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${baseUrl}${path}`, {
            method,
            headers: finalHeaders,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal,
        });
    } catch (error) {
        // `fetch` solo rechaza por red/abort: se traduce a un error del dominio.
        // En desarrollo se muestra la URL intentada para diagnosticar redes.
        // `NODE_ENV` se inlinea en build (Metro y Vite); no se lee en runtime.
        const detail = process.env.NODE_ENV === 'production' ? '' : ` (${baseUrl})`;

        throw new ApiError(`No se pudo conectar con el servidor.${detail}`, {
            code: error?.name === 'AbortError' ? 'ABORTED' : 'NETWORK_ERROR',
            cause: error,
        });
    }

    const payload = await readPayload(response);

    if (!response.ok) {
        throw new ApiError(
            payload?.message || `La solicitud falló con estado ${response.status}.`,
            {
                status: response.status,
                code: payload?.error || 'HTTP_ERROR',
                payload,
            },
        );
    }

    return payload;
}

/**
 * Lee el cuerpo de la respuesta sin romper si el backend devuelve texto,
 * un 204 sin contenido o un JSON inválido.
 *
 * @param {Response} response Respuesta de `fetch`.
 * @returns {Promise<any>} Contenido parseado o `null`.
 */
async function readPayload(response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json().catch(() => null);
    }

    const text = await response.text();
    return text || null;
}
