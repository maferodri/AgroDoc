/**
 * Documento: pruebas E2E web de login por rol, guard de rutas y panel admin.
 * El backend se intercepta con Playwright: no se llama a servicios reales.
 */
import { expect, test } from '@playwright/test';
import { mockApi, seedSession, users } from './fixtures.js';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

async function login(page, email, password = 'AgroDoc123') {
    await page.goto('/login');
    await page.getByLabel('Correo Electrónico').fill(email);
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
}

test('el admin inicia sesión y aterriza en el dashboard', async ({ page }) => {
    await login(page, 'admin@agrodoc.com');

    await expect(page).toHaveURL(/\/admin$/);
    await expect(
        page.getByText('Panel de administración')
    ).toBeVisible();
    await expect(page.getByText('Usuarios')).toBeVisible();
});

test('un agricultor en /admin es redirigido a su ruta', async ({ page }) => {
    await seedSession(page, users.farmer);
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/agricultor$/);
    await expect(page.getByText('Panel del agricultor')).toBeVisible();
    await expect(page.getByText('Panel de administración')).toHaveCount(0);
});

test('el admin desactiva un usuario con confirmación', async ({ page }) => {
    await login(page, 'admin@agrodoc.com');
    await expect(page.getByText('Panel de administración')).toBeVisible();

    await page.getByRole('button', { name: 'Desactivar', exact: true }).first().click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await expect(
        page.getByText('Desactivar a María Agricultora')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirmar' }).click();

    await expect(
        page.getByRole('button', { name: 'Activar', exact: true })
    ).toHaveCount(2);
});

test('el agrónomo ve la bandeja con imagen, diagnóstico y confianza', async ({
    page,
}) => {
    await login(page, 'agronomo@agrodoc.com');

    await expect(page).toHaveURL(/\/agronomo$/);
    await expect(page.getByText('Bandeja de consultas')).toBeVisible();
    await expect(page.getByText('Mancha foliar del maíz')).toBeVisible();
    await expect(page.getByText('92%')).toBeVisible();
    await expect(
        page.getByRole('img', { name: 'Foto del cultivo de María Agricultora' })
    ).toBeVisible();
});
