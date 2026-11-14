/**
 * Documento: pruebas del feature de diagnóstico y suscripciones.
 * Comprueban la confianza alta/media/baja con MSW, la derivación a agrónomo y
 * que el plan básico no muestre muro de pago.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@agrodoc/ui';
import { light } from '@agrodoc/tokens';
import { analyzeDiagnosis } from './api/diagnosisApi.js';
import { DiagnosisResult } from './components/DiagnosisResult.jsx';
import {
    canAccessBasicDiagnosis,
    subscriptionSchema,
} from '../subscriptions/schemas/subscriptionSchemas.js';
import { getSubscription } from '../subscriptions/api/subscriptionApi.js';
import { loginUser } from '../auth/api/authApi.js';

const renderWithTheme = (ui) =>
    render(<ThemeProvider theme={light}>{ui}</ThemeProvider>);

describe('analyzeDiagnosis con MSW', () => {
    it('devuelve confianza alta para una foto sana', async () => {
        const result = await analyzeDiagnosis({ image: 'sample-crop' });

        expect(result.confidence).toBeGreaterThanOrEqual(80);
        expect(result.requires_agronomist).toBe(false);
    });

    it('devuelve confianza media sin derivar al agrónomo', async () => {
        const result = await analyzeDiagnosis({ image: 'medium-crop' });

        expect(result.confidence).toBeGreaterThanOrEqual(50);
        expect(result.confidence).toBeLessThan(80);
        expect(result.requires_agronomist).toBe(false);
    });

    it('devuelve confianza baja y requiere agrónomo', async () => {
        const result = await analyzeDiagnosis({ image: 'low-crop' });

        expect(result.confidence).toBeLessThan(50);
        expect(result.requires_agronomist).toBe(true);
    });
});

describe('DiagnosisResult', () => {
    const baseDiagnosis = {
        id: '11111111-1111-4111-8111-111111111111',
        disease_name: 'Mancha foliar del maíz',
        description: 'Lesiones compatibles con mancha foliar.',
        confidence: 92.8,
        requires_agronomist: false,
        recommendations: ['Retirar hojas afectadas.'],
        created_at: '2026-01-15T10:00:00.000Z',
    };

    it('muestra la confianza como entero', () => {
        renderWithTheme(<DiagnosisResult diagnosis={baseDiagnosis} />);

        expect(screen.getByTestId('confidence-value')).toHaveTextContent('93%');
        expect(
            screen.queryByText('Consultar con un agrónomo')
        ).not.toBeInTheDocument();
    });

    it('ofrece consulta con agrónomo cuando la confianza es baja', () => {
        const onRequestConsultation = vi.fn();

        renderWithTheme(
            <DiagnosisResult
                diagnosis={{ ...baseDiagnosis, confidence: 34.7 }}
                onRequestConsultation={onRequestConsultation}
            />
        );

        expect(screen.getByTestId('confidence-value')).toHaveTextContent('35%');
        expect(
            screen.getByText('Consultar con un agrónomo')
        ).toBeInTheDocument();
        expect(screen.getByTestId('confidence-hint')).toBeInTheDocument();
    });
});

describe('suscripción básica', () => {
    it('permite el diagnóstico básico sin muro de pago', async () => {
        const session = await loginUser({
            email: 'agricultor@agrodoc.com',
            password: 'AgroDoc123',
        });
        const subscription = await getSubscription({
            accessToken: session.access_token,
        });

        expect(subscription.plan).toBe('basic');
        expect(canAccessBasicDiagnosis(subscription)).toBe(true);
    });

    it('rechaza planes inactivos', () => {
        const subscription = subscriptionSchema.parse({
            plan: 'basic',
            status: 'inactive',
            features: { basic_diagnosis: true, consultations: false },
        });

        expect(canAccessBasicDiagnosis(subscription)).toBe(false);
        expect(canAccessBasicDiagnosis(null)).toBe(false);
    });
});
