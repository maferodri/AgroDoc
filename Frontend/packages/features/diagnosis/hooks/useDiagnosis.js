/**
 * Documento: hooks del feature de diagnóstico.
 * Encapsulan React Query para que las pantallas solo manejen estado visual.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore.js';
import {
    analyzeDiagnosis,
    createConsultation,
    listConsultations,
} from '../api/diagnosisApi.js';
import { diagnosisKeys } from './queryKeys.js';

/** Ejecuta el análisis de una foto y expone el resultado de la mutación. */
export function useAnalyzeDiagnosis() {
    return useMutation({
        mutationFn: analyzeDiagnosis,
    });
}

/** Lista las consultas del agrónomo autenticado. */
export function useConsultations({ enabled = true } = {}) {
    const accessToken = useAuthStore((state) => state.accessToken);

    return useQuery({
        queryKey: diagnosisKeys.consultations,
        queryFn: ({ signal }) => listConsultations({ accessToken, signal }),
        enabled: enabled && Boolean(accessToken),
    });
}

/** Crea una consulta y refresca la bandeja del agrónomo. */
export function useCreateConsultation() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input) => createConsultation(input, { accessToken }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: diagnosisKeys.consultations,
            });
        },
    });
}
