/**
 * Documento: datos y rutas simuladas para Playwright.
 * Reproduce el contrato de MSW en el navegador sin levantar el backend real.
 */

export const users = {
    farmer: {
        id: '22222222-2222-4222-8222-222222222222',
        email: 'agricultor@agrodoc.com',
        full_name: 'María Agricultora',
        role: 'farmer',
        is_active: true,
        created_at: '2026-01-15T10:00:00.000Z',
    },
    agronomist: {
        id: '33333333-3333-4333-8333-333333333333',
        email: 'agronomo@agrodoc.com',
        full_name: 'Carlos Agrónomo',
        role: 'agronomist',
        is_active: true,
        created_at: '2026-01-15T10:00:00.000Z',
    },
    admin: {
        id: '44444444-4444-4444-8444-444444444444',
        email: 'admin@agrodoc.com',
        full_name: 'Ana Administradora',
        role: 'admin',
        is_active: true,
        created_at: '2026-01-15T10:00:00.000Z',
    },
    inactive: {
        id: '55555555-5555-4555-8555-555555555555',
        email: 'inactivo@agrodoc.com',
        full_name: 'Pedro Inactivo',
        role: 'farmer',
        is_active: false,
        created_at: '2026-01-15T10:00:00.000Z',
    },
};

const pixel =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const consultations = [
    {
        id: '66666666-6666-4666-8666-666666666666',
        farmer_name: 'María Agricultora',
        image_url: pixel,
        status: 'pending',
        diagnosis: {
            disease_name: 'Mancha foliar del maíz',
            confidence: 91.6,
        },
        created_at: '2026-01-15T10:00:00.000Z',
    },
];

/** Guarda una sesión en localStorage antes de cargar la app. */
export async function seedSession(page, user) {
    await page.addInitScript(
        ({ sessionUser, storageKey }) => {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    access_token: `access.${sessionUser.id}`,
                    refresh_token: `refresh.${sessionUser.id}`,
                    user: sessionUser,
                })
            );
        },
        { sessionUser: user, storageKey: 'agrodoc.auth.session' }
    );
}

/**
 * Intercepta todas las llamadas al backend simulado.
 *
 * @param {import('@playwright/test').Page} page Página de Playwright.
 * @returns {Promise<void>}
 */
export async function mockApi(page) {
    let currentUsers = Object.values(users).map((user) => ({ ...user }));

    await page.route('**/api/v1/**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname.replace('/api/v1', '');
        const method = request.method();
        const json = (body, status = 200) =>
            route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(body),
            });

        if (path === '/auth/login' && method === 'POST') {
            const body = request.postDataJSON();
            const user = currentUsers.find(
                (candidate) => candidate.email === body.email
            );

            if (!user) {
                return json(
                    { error: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' },
                    401
                );
            }

            return json({
                access_token: `access.${user.id}`,
                refresh_token: `refresh.${user.id}`,
                token_type: 'Bearer',
                user,
            });
        }

        if (path === '/auth/logout') {
            return route.fulfill({ status: 204 });
        }

        if (path === '/users/me') {
            const token = (request.headers().authorization || '').replace(
                /^Bearer\s+access\./,
                ''
            );
            const user = currentUsers.find((candidate) => candidate.id === token);

            return user
                ? json(user)
                : json({ error: 'UNAUTHORIZED', message: 'Sesión' }, 401);
        }

        if (path === '/admin/users' && method === 'GET') {
            return json(currentUsers);
        }

        if (path.startsWith('/admin/users/') && method === 'PATCH') {
            const id = path.split('/').pop();
            const body = request.postDataJSON();
            currentUsers = currentUsers.map((user) =>
                user.id === id
                    ? { ...user, is_active: Boolean(body.is_active) }
                    : user
            );
            const updated = currentUsers.find((user) => user.id === id);

            return json(updated);
        }

        if (path === '/consultations' && method === 'GET') {
            return json(consultations);
        }

        if (path === '/subscriptions/me') {
            return json({
                plan: 'basic',
                status: 'active',
                features: { basic_diagnosis: true, consultations: false },
            });
        }

        if (path === '/diagnosis' && method === 'POST') {
            return json({
                id: '11111111-1111-4111-8111-111111111111',
                disease_name: 'Mancha foliar del maíz',
                description: 'Lesiones compatibles con mancha foliar.',
                confidence: 92.8,
                requires_agronomist: false,
                recommendations: ['Retirar hojas afectadas.'],
                created_at: '2026-01-15T10:00:00.000Z',
            });
        }

        return json({ error: 'NOT_FOUND', message: path }, 404);
    });
}
