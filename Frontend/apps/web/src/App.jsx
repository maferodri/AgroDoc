// apps/web/src/App.jsx
import React from 'react';
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