/**
 * Documento: punto de entrada del cliente web.
 * Fija la URL del backend antes de montar la app y renderiza React en #root.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setApiBaseUrl } from '@agrodoc/api'
import './index.css'
import App from './App.jsx'

// Vite solo expone al navegador las variables con prefijo VITE_ y solo a través
// de `import.meta.env`. Se usa antes de montar para que cualquier petición
// posterior salga hacia el backend y no hacia el valor por defecto local.
if (import.meta.env.VITE_API_URL) {
  setApiBaseUrl(import.meta.env.VITE_API_URL)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
