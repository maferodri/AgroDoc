/**
 * Documento: raíz de la app web.
 * Compone el proveedor de tema y el router de la aplicación.
 */
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <ThemeProvider theme={light}>
      <AppRouter />
    </ThemeProvider>
  );
}