/**
 * Documento: raíz de la app móvil.
 * Compone el tema claro, React Query y la primera pantalla (login).
 */
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import LoginScreen from './src/screens/auth/LoginScreen';

export default function App() {
  // Se crea una sola instancia por montaje para conservar la caché de auth.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1 },
        },
      })
  );

  return (
    <ThemeProvider theme={light}>
      <QueryClientProvider client={queryClient}>
        <LoginScreen />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
