/**
 * Documento: hooks de suscripciones.
 * Mantienen el plan en caché para decidir si se muestra el muro de pago.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/authStore.js';
import { createPayment, getSubscription } from '../api/subscriptionApi.js';

export const subscriptionKeys = {
    all: ['subscriptions'],
    me: ['subscriptions', 'me'],
};

/** Consulta la suscripción vigente. */
export function useSubscription({ enabled = true } = {}) {
    const accessToken = useAuthStore((state) => state.accessToken);

    return useQuery({
        queryKey: subscriptionKeys.me,
        queryFn: ({ signal }) => getSubscription({ accessToken, signal }),
        enabled: enabled && Boolean(accessToken),
    });
}

/** Registra un pago y refresca el estado de la suscripción. */
export function useCreatePayment() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input) => createPayment(input, { accessToken }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        },
    });
}
