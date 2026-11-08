/**
 * Documento: handlers MSW compartidos de AgroDoc.
 * Simulan el contrato del backend para las pruebas de features, web y móvil.
 * Nunca se llama a un servicio real: todas las respuestas viven aquí.
 */
import { HttpResponse, http } from 'msw';

export const API_BASE_URL = 'http://localhost:8000/api/v1';

const now = '2026-01-15T10:00:00.000Z';

const AUTH_USER_ID = '11111111-1111-4111-8111-111111111111';

/** Usuarios de demostración por rol. */
export const DEMO_USERS = {
    farmer: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'agricultor@agrodoc.com',
        full_name: 'María Agricultora',
        role: 'farmer',
        is_active: true,
        created_at: now,
    },
    agronomist: {
        id: '33333333-3333-4333-8333-333333333333',
        email: 'agronomo@agrodoc.com',
        full_name: 'Carlos Agrónomo',
        role: 'agronomist',
        is_active: true,
        created_at: now,
    },
    admin: {
        id: '44444444-4444-4444-8444-444444444444',
        email: 'admin@agrodoc.com',
        full_name: 'Ana Administradora',
        role: 'admin',
        is_active: true,
        created_at: now,
    },
    inactive: {
        id: '55555555-5555-4555-8555-555555555555',
        email: 'inactivo@agrodoc.com',
        full_name: 'Pedro Inactivo',
        role: 'farmer',
        is_active: false,
        created_at: now,
    },
};

/** Estado mutable de las pruebas; se reinicia con `resetMockDatabase`. */
let users = [];
let consultations = [];

/** Vuelve los datos simulados a su estado inicial. */
export function resetMockDatabase() {
    users = Object.values(DEMO_USERS).map((user) => ({ ...user }));
    consultations = defaultConsultations();
}

/** Sesión simulada con tokens que codifican el id del usuario. */
function sessionFor(user) {
    return {
        access_token: `access.${user.id}`,
        refresh_token: `refresh.${user.id}`,
        token_type: 'Bearer',
        user,
    };
}

/** Extrae el usuario autenticado a partir del Bearer token. */
function userFromRequest(request) {
    const header = request.headers.get('authorization') || '';
    const token = header.replace(/^Bearer\s+/i, '');
    const id = token.replace(/^access\./, '');

    return users.find((user) => user.id === id) ?? null;
}

function errorResponse(status, code, message) {
    return HttpResponse.json({ error: code, message }, { status });
}

function defaultConsultations() {
    return [
        {
            id: '66666666-6666-4666-8666-666666666666',
            farmer_name: 'María Agricultora',
            image_url: 'https://images.agrodoc.test/maiz-mancha.jpg',
            status: 'pending',
            diagnosis: {
                disease_name: 'Mancha foliar del maíz',
                confidence: 91.6,
            },
            created_at: now,
        },
        {
            id: '77777777-7777-4777-8777-777777777777',
            farmer_name: 'Pedro Inactivo',
            image_url: 'https://images.agrodoc.test/tomate-herrumbre.jpg',
            status: 'answered',
            diagnosis: {
                disease_name: 'Roya del tomate',
                confidence: 42.2,
            },
            created_at: now,
        },
    ];
}

resetMockDatabase();

function diagnosisFromImage(image = '') {
    const value = String(image).toLowerCase();

    if (value.includes('low') || value.includes('baja')) {
        return {
            id: AUTH_USER_ID,
            disease_name: 'Posible deficiencia nutricional',
            description:
                'La imagen no permite confirmar la causa con seguridad.',
            confidence: 34.7,
            requires_agronomist: true,
            recommendations: ['Fotografía hojas y tallo con buena luz.'],
            image_url: 'https://images.agrodoc.test/diagnostico-baja.jpg',
            created_at: now,
        };
    }

    if (value.includes('medium') || value.includes('media')) {
        return {
            id: AUTH_USER_ID,
            disease_name: 'Estrés hídrico moderado',
            description: 'Hay señales leves de falta de agua en las hojas.',
            confidence: 64.2,
            requires_agronomist: false,
            recommendations: ['Revisar la humedad del suelo esta semana.'],
            image_url: 'https://images.agrodoc.test/diagnostico-media.jpg',
            created_at: now,
        };
    }

    return {
        id: AUTH_USER_ID,
        disease_name: 'Mancha foliar del maíz',
        description:
            'Se detectaron lesiones compatibles con mancha foliar en las hojas analizadas.',
        confidence: 92.8,
        requires_agronomist: false,
        recommendations: [
            'Retirar las hojas más afectadas.',
            'Evitar el riego por aspersión al atardecer.',
        ],
        image_url: 'https://images.agrodoc.test/diagnostico-alta.jpg',
        created_at: now,
    };
}

/** Registro de cuenta; atiende tanto `/auth/register` como `/register`. */
async function handleRegister({ request }) {
    const body = await request.json();

    if (users.some((user) => user.email === body.email)) {
        return errorResponse(409, 'EMAIL_TAKEN', 'El correo ya está registrado.');
    }

    const user = {
        id: crypto.randomUUID(),
        email: body.email,
        full_name: body.full_name,
        role: body.role === 'agronomist' ? 'agronomist' : 'farmer',
        is_active: true,
        created_at: now,
    };

    users = [...users, user];

    return HttpResponse.json(sessionFor(user), { status: 201 });
}

/** Inicio de sesión; atiende tanto `/auth/login` como `/login`. */
async function handleLogin({ request }) {
    const body = await request.json();
    const user = users.find((candidate) => candidate.email === body.email);

    if (!user || !body.password) {
        return errorResponse(
            401,
            'INVALID_CREDENTIALS',
            'Usuario o contraseña incorrectos.'
        );
    }

    if (!user.is_active) {
        return errorResponse(403, 'USER_INACTIVE', 'La cuenta está desactivada.');
    }

    return HttpResponse.json(sessionFor(user));
}

/** Handlers que cubren auth, diagnóstico, consultas, pagos y administración. */
export const handlers = [
    // Alias de ruta: `openapi.yaml` define /auth/register y /auth/login, pero el
    // backend real y `authApi.js` usan /register y /login. Se cubren ambas rutas
    // con el mismo handler para que los mocks no dependan de una en particular.
    http.post(`${API_BASE_URL}/auth/register`, handleRegister),
    http.post(`${API_BASE_URL}/register`, handleRegister),

    http.post(`${API_BASE_URL}/auth/login`, handleLogin),
    http.post(`${API_BASE_URL}/login`, handleLogin),

    http.post(`${API_BASE_URL}/auth/refresh`, async ({ request }) => {
        const body = await request.json();
        const id = String(body.refresh_token || '').replace(/^refresh\./, '');
        const user = users.find((candidate) => candidate.id === id);

        if (!user) {
            return errorResponse(401, 'INVALID_TOKEN', 'El token no es válido.');
        }

        return HttpResponse.json(sessionFor(user));
    }),

    http.post(`${API_BASE_URL}/auth/logout`, () =>
        new HttpResponse(null, { status: 204 })
    ),

    http.post(`${API_BASE_URL}/auth/recover-password`, async ({ request }) => {
        const body = await request.json();

        return HttpResponse.json({
            message: `Si ${body.email} está registrado, recibirás un enlace.`,
        });
    }),

    http.get(`${API_BASE_URL}/users/me`, ({ request }) => {
        const user = userFromRequest(request);

        if (!user) {
            return errorResponse(401, 'UNAUTHORIZED', 'Sesión expirada.');
        }

        return HttpResponse.json(user);
    }),

    http.get(`${API_BASE_URL}/agronomists`, ({ request }) => {
        const user = userFromRequest(request);

        if (!user) {
            return errorResponse(401, 'UNAUTHORIZED', 'Sesión expirada.');
        }

        return HttpResponse.json([
            {
                ...DEMO_USERS.agronomist,
                profile: {
                    user_id: DEMO_USERS.agronomist.id,
                    specialty: 'Fitopatología',
                    license_number: 'AGR-1234',
                    is_available: true,
                },
            },
        ]);
    }),

    http.post(`${API_BASE_URL}/diagnosis`, async ({ request }) => {
        const body = await request.json();

        return HttpResponse.json(diagnosisFromImage(body.image));
    }),

    http.get(`${API_BASE_URL}/consultations`, ({ request }) => {
        const user = userFromRequest(request);

        if (!user) {
            return errorResponse(401, 'UNAUTHORIZED', 'Sesión expirada.');
        }

        return HttpResponse.json(consultations);
    }),

    http.post(`${API_BASE_URL}/consultations`, async ({ request }) => {
        const body = await request.json();
        const base = consultations[0];

        return HttpResponse.json(
            {
                ...base,
                id: crypto.randomUUID(),
                status: 'pending',
                created_at: now,
                diagnosis_id: body.diagnosis_id,
            },
            { status: 201 }
        );
    }),

    http.get(`${API_BASE_URL}/subscriptions/me`, ({ request }) => {
        const user = userFromRequest(request);

        if (!user) {
            return errorResponse(401, 'UNAUTHORIZED', 'Sesión expirada.');
        }

        return HttpResponse.json({
            plan: 'basic',
            status: 'active',
            features: {
                basic_diagnosis: true,
                consultations: false,
            },
        });
    }),

    http.post(`${API_BASE_URL}/payments`, async ({ request }) => {
        const body = await request.json();

        return HttpResponse.json(
            {
                ...body,
                id: crypto.randomUUID(),
                status: 'approved',
            },
            { status: 201 }
        );
    }),

    http.get(`${API_BASE_URL}/admin/users`, ({ request }) => {
        const user = userFromRequest(request);

        if (!user || user.role !== 'admin') {
            return errorResponse(403, 'FORBIDDEN', 'Acceso solo para administradores.');
        }

        return HttpResponse.json(users);
    }),

    http.patch(`${API_BASE_URL}/admin/users/:id`, async ({ request, params }) => {
        const user = userFromRequest(request);

        if (!user || user.role !== 'admin') {
            return errorResponse(403, 'FORBIDDEN', 'Acceso solo para administradores.');
        }

        const body = await request.json();
        const index = users.findIndex((candidate) => candidate.id === params.id);

        if (index < 0) {
            return errorResponse(404, 'NOT_FOUND', 'Usuario no encontrado.');
        }

        users[index] = { ...users[index], is_active: Boolean(body.is_active) };

        return HttpResponse.json(users[index]);
    }),
];
