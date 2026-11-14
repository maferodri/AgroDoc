/**
 * Documento: API pública de @agrodoc/features.
 * Reexporta la lógica de cada épica; las apps nunca importan rutas internas.
 */
export * from './auth/index.js';
export { adminUserListSchema, listUsers, setUserActive } from './admin/api/adminApi.js';
export {
    adminKeys,
    useAdminUsers,
    useSetUserActive,
} from './admin/hooks/useAdminUsers.js';
export { cropResponseSchema, cropSchema } from './crops/schemas/cropSchemas.js';
export {
    consultationListSchema,
    consultationSchema,
    createConsultationSchema,
    diagnosisRequestSchema,
    diagnosisSchema,
} from './diagnosis/schemas/diagnosisSchemas.js';
export {
    analyzeDiagnosis,
    createConsultation,
    listConsultations,
} from './diagnosis/api/diagnosisApi.js';
export {
    useAnalyzeDiagnosis,
    useConsultations,
    useCreateConsultation,
} from './diagnosis/hooks/useDiagnosis.js';
export { DiagnosisResult } from './diagnosis/components/DiagnosisResult.jsx';
export {
    PAYMENT_CURRENCIES,
    PAYMENT_METHODS,
    paymentResponseSchema,
    paymentSchema,
} from './subscriptions/schemas/paymentSchemas.js';
export {
    canAccessBasicDiagnosis,
    subscriptionSchema,
} from './subscriptions/schemas/subscriptionSchemas.js';
export {
    createPayment,
    getSubscription,
} from './subscriptions/api/subscriptionApi.js';
export {
    subscriptionKeys,
    useCreatePayment,
    useSubscription,
} from './subscriptions/hooks/useSubscription.js';
