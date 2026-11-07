/**
 * Documento: utilidades de prueba para features.
 * Envuelve hooks y componentes con un QueryClient aislado por caso.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';

/** Crea un QueryClient sin reintentos para pruebas deterministas. */
export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
}

/** Envuelve el árbol con el proveedor de React Query. */
export function createWrapper(queryClient = createTestQueryClient()) {
    return function Wrapper({ children }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

/** Renderiza un hook con React Query. */
export function renderHookWithQuery(callback) {
    return renderHook(callback, { wrapper: createWrapper() });
}

/** Renderiza un componente con React Query. */
export function renderWithQuery(ui) {
    return render(ui, { wrapper: createWrapper() });
}
