/**
 * Documento: persistencia local de la sesión de auth.
 * En web usa `localStorage`; en móvil mantiene la sesión en memoria hasta que
 * se conecte un almacenamiento seguro (pendiente en apps/mobile).
 */
import { storedSessionSchema } from '../schemas/authSchemas.js';

const STORAGE_KEY = 'agrodoc.auth.session';

// Respaldo en memoria para plataformas sin `localStorage` (React Native).
let memorySession = null;

/** Devuelve el almacenamiento web si existe; nunca lanza en otros entornos. */
function getWebStorage() {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
        return null;
    }
}

/**
 * Lee la sesión guardada y la valida contra el contrato.
 * Si el contenido está corrupto se descarta para no romper el arranque.
 *
 * @returns {object|null} Sesión válida o `null`.
 */
export function readStoredSession() {
    const storage = getWebStorage();
    const raw = storage?.getItem(STORAGE_KEY);

    if (!raw) {
        return memorySession;
    }

    try {
        return storedSessionSchema.parse(JSON.parse(raw));
    } catch {
        storage.removeItem(STORAGE_KEY);
        return null;
    }
}

/**
 * Guarda la sesión para restaurarla en la próxima carga de la app.
 *
 * @param {{ access_token: string, refresh_token: string, user: object }} session
 */
export function writeStoredSession(session) {
    const value = storedSessionSchema.parse(session);
    memorySession = value;

    try {
        getWebStorage()?.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Sin cuota o en modo privado: queda el respaldo en memoria.
    }
}

/** Elimina la sesión persistida al cerrar sesión o expirar el token. */
export function clearStoredSession() {
    memorySession = null;

    try {
        getWebStorage()?.removeItem(STORAGE_KEY);
    } catch {
        // Nada que limpiar si el almacenamiento no está disponible.
    }
}
