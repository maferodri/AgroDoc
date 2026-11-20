/**
 * Documento: pruebas de los esquemas Zod de auth.
 * Cubren registro (nombre, correo, contraseña y confirmación), login y
 * recuperación de contraseña.
 */
import { describe, expect, it } from 'vitest';
import {
    getFieldErrors,
    loginRequestSchema,
    passwordResetConfirmFormSchema,
    passwordResetConfirmSchema,
    passwordResetVerifySchema,
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

describe('passwordResetVerifySchema', () => {
    it('exige correo y código', () => {
        expect(
            passwordResetVerifySchema.safeParse({
                email: 'a@b.com',
                code: '123456',
            }).success
        ).toBe(true);

        const result = passwordResetVerifySchema.safeParse({
            email: 'a@b.com',
            code: '   ',
        });

        expect(result.success).toBe(false);
        expect(getFieldErrors(result.error).code).toBeTruthy();
    });
});

describe('passwordResetConfirmSchema', () => {
    it('exige token y contraseña de al menos 8 caracteres', () => {
        expect(
            passwordResetConfirmSchema.safeParse({
                reset_token: 'token',
                new_password: 'NuevaClave123',
            }).success
        ).toBe(true);

        const result = passwordResetConfirmSchema.safeParse({
            reset_token: '',
            new_password: 'corta',
        });

        expect(result.success).toBe(false);
        expect(getFieldErrors(result.error)).toMatchObject({
            reset_token: expect.any(String),
            new_password: expect.any(String),
        });
    });
});

describe('passwordResetConfirmFormSchema', () => {
    it('exige un código de 6 dígitos y contraseñas iguales', () => {
        const valid = {
            code: '123456',
            new_password: 'NuevaClave123',
            confirm_password: 'NuevaClave123',
        };

        expect(passwordResetConfirmFormSchema.safeParse(valid).success).toBe(
            true
        );

        const shortCode = passwordResetConfirmFormSchema.safeParse({
            ...valid,
            code: '123',
        });
        expect(getFieldErrors(shortCode.error).code).toBe(
            'Ingresa el código de 6 dígitos.'
        );

        const mismatch = passwordResetConfirmFormSchema.safeParse({
            ...valid,
            confirm_password: 'OtraClave123',
        });
        expect(getFieldErrors(mismatch.error).confirm_password).toBe(
            'Las contraseñas no coinciden.'
        );
    });
});
