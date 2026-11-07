/**
 * Documento: API pública de mocks de @agrodoc/api.
 * Permite que las suites compartan handlers y servidor MSW sin duplicarlos.
 */
export { API_BASE_URL, DEMO_USERS, handlers, resetMockDatabase } from './handlers.js';
export { server } from './server.js';
