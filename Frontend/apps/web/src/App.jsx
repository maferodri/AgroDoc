/**
 * Documento: raíz de la app web.
 * Compone el tema, React Query (requerido por los hooks de auth) y el router.
 */
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import AppRouter from './router/AppRouter';

export default function App() {
  // Se crea una sola instancia por montaje para no perder la caché en renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <ThemeProvider theme={light}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
