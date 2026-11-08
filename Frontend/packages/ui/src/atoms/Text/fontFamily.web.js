/**
 * Documento: resolución web de la familia tipográfica.
 * Agrega una pila sans-serif para que el navegador no caiga en la fuente
 * serif por defecto cuando Inter no está cargada.
 */
export function resolveFontFamily(family) {
    const fallback = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    return family ? `${family}, ${fallback}` : fallback;
}
