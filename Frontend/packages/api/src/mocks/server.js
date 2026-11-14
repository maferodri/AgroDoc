/**
 * Documento: servidor MSW para pruebas con Node.
 * Las suites lo levantan en `beforeAll`, lo limpian entre casos y lo cierran al
 * terminar para no contaminar otras pruebas.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

export const server = setupServer(...handlers);

export { API_BASE_URL, DEMO_USERS, handlers, resetMockDatabase } from './handlers.js';
