/**
 * Documento: rutas de la app web.
 * Expone el login como vista pública, redirige la raíz y registra el
 * Playground únicamente en desarrollo.
 */
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Playground from '../pages/Playground';

export default function AppRouter() {
    return (
        <BrowserRouter>
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* 👇 Solo en desarrollo, fuera de ProtectedRoute */}
            {import.meta.env.DEV && (
            <Route path="/playground" element={<Playground />} />
            )}

            {/* Rutas privadas (ProtectedRoute) van después */}
        </Routes>
        </BrowserRouter>
    );
}
