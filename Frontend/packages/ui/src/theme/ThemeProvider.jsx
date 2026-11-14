/**
 * Documento: proveedor de tema de @agrodoc/ui.
 * Comparte el objeto de tema con los componentes mediante contexto.
 */
import React, { createContext, useMemo } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ theme, children }) {
  const value = useMemo(() => theme, [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}