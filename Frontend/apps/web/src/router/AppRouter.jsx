/**
 * Documento: rutas de la app web.
 * Registra el Playground únicamente en desarrollo.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Playground from '../pages/Playground';   // 👈 import arriba

export default function AppRouter() {
    return (
        <BrowserRouter>
        <Routes>
            {/* Rutas públicas */}
            {/* <Route path="/login" element={<LoginPage />} /> */}

            {/* 👇 Solo en desarrollo, fuera de ProtectedRoute */}
            {import.meta.env.DEV && (
            <Route path="/playground" element={<Playground />} />
            )}

            {/* Rutas privadas (ProtectedRoute) van después */}
        </Routes>
        </BrowserRouter>
    );
}