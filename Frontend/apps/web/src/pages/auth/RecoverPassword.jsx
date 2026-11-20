/**
 * Documento: pantalla de recuperación de contraseña web (HU1.3).
 * Compone los dos pasos (solicitud del código y nueva contraseña) sobre el
 * fondo de registro y delega la lógica a los hooks de `@agrodoc/features`.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { useNavigate } from 'react-router-dom';
import {
    useConfirmPasswordResetForm,
    useRecoverPasswordForm,
} from '@agrodoc/features';
import {
    PasswordResetConfirmForm,
    PasswordResetForm,
    REGISTER_BACKGROUND,
    useTheme,
} from '@agrodoc/ui';
import { ROUTES } from '../../router/routes';
import { getStyles } from './RecoverPassword.styles';

export default function RecoverPassword() {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const navigate = useNavigate();

    const { email, errors, message, error, loading, setEmail, submit } =
        useRecoverPasswordForm();

    // El paso 2 encadena verificación y confirmación; al terminar vuelve al login.
    const confirm = useConfirmPasswordResetForm({
        email,
        onSuccess: () => navigate(ROUTES.login),
    });

    const handleResend = () => {
        confirm.reset();
        submit();
    };

    return (
        <View style={styles.root}>
            <Image
                source={REGISTER_BACKGROUND}
                style={styles.background}
                resizeMode="cover"
                accessible={false}
            />
            <View style={styles.content}>
                {message ? (
                    <PasswordResetConfirmForm
                        variant="web"
                        code={confirm.code}
                        onChangeCode={confirm.setCode}
                        newPassword={confirm.newPassword}
                        confirmPassword={confirm.confirmPassword}
                        onChangeNewPassword={confirm.setNewPassword}
                        onChangeConfirmPassword={confirm.setConfirmPassword}
                        onSubmit={confirm.submit}
                        onCancel={() => navigate(ROUTES.login)}
                        onResend={handleResend}
                        codeError={confirm.errors.code}
                        newPasswordError={confirm.errors.newPassword}
                        confirmPasswordError={confirm.errors.confirmPassword}
                        error={confirm.error}
                        loading={confirm.loading}
                    />
                ) : (
                    <PasswordResetForm
                        variant="web"
                        email={email}
                        onChangeEmail={setEmail}
                        onSubmit={submit}
                        onLogin={() => navigate(ROUTES.login)}
                        emailError={errors.email}
                        error={error}
                        message={message}
                        loading={loading}
                    />
                )}
            </View>
        </View>
    );
}
