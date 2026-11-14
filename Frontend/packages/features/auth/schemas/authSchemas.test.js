/**
 * Documento: pruebas de los esquemas Zod de auth.
 * Cubren registro (nombre, correo, contraseña y confirmación), login y
 * recuperación de contraseña.
 */
import { describe, expect, it } from 'vitest';
import {
    getFieldErrors,
    loginRequestSchema,
    recoverPasswordSchema,
    registerFormSchema,
    registerRequestSchema,
} from './authSchemas.js';

const validRegister = {
    full_name: 'María Agricultora',
    email: 'maria@agrodoc.com',
    password: 'AgroDoc123',
    confirm_password: 'AgroDoc123',
};

describe('registerRequestSchema', () => {
    it('acepta un registro válido', () => {
        expect(registerRequestSchema.safeParse(validRegister).success).toBe(true);
    });

    it('exige nombre, correo y contraseña', () => {
        const result = registerRequestSchema.safeParse({
            full_name: '',
            email: 'correo-invalido',
            password: 'corta',
        });

        expect(result.success).toBe(false);
        expect(getFieldErrors(result.error)).toMatchObject({
            full_name: expect.any(String),
            email: expect.any(String),
            password: expect.any(String),
        });
    });
});

describe('registerFormSchema', () => {
    it('exige confirmar la contraseña', () => {
        const result = registerFormSchema.safeParse({
            ...validRegister,
            confirm_password: '',
        });

        expect(result.success).toBe(false);
        expect(getFieldErrors(result.error).confirm_password).toBeTruthy();
    });

    it('rechaza contraseñas distintas', () => {
        const result = registerFormSchema.safeParse({
            ...validRegister,
            confirm_password: 'Otra12345',
        });

        expect(result.success).toBe(false);
        expect(getFieldErrors(result.error).confirm_password).toBe(
            'Las contraseñas no coinciden.'
        );
    });
});

describe('loginRequestSchema', () => {
    it('acepta correo y contraseña', () => {
        expect(
            loginRequestSchema.safeParse({
                email: 'admin@agrodoc.com',
                password: 'secreto',
            }).success
        ).toBe(true);
    });

    it('rechaza un correo inválido', () => {
        expect(
            loginRequestSchema.safeParse({
                email: 'admin',
                password: 'secreto',
            }).success
        ).toBe(false);
    });
});

describe('recoverPasswordSchema', () => {
    it('valida el correo de recuperación', () => {
        expect(recoverPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(
            true
        );
        expect(recoverPasswordSchema.safeParse({ email: 'a' }).success).toBe(
            false
        );
    });
});
