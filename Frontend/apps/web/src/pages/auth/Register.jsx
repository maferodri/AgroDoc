/**
 * Documento: pantalla de registro web (HU1.2).
 * Usa el organismo RegisterForm y la lógica compartida de `@agrodoc/features`;
 * la página solo compone el fondo, la tarjeta y la navegación al login.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useRegisterForm } from '@agrodoc/features';
import { REGISTER_BACKGROUND, RegisterForm, useTheme } from '@agrodoc/ui';
import { ROUTES } from '../../router/routes';
import { getStyles } from './Register.styles';

export default function Register() {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const navigate = useNavigate();

    // Al registrarse, el store guarda la sesión y el router redirige al lobby.
    const {
        fullName,
        email,
        password,
        confirmPassword,
        consentAccepted,
        errors,
        error,
        loading,
        setFullName,
        setEmail,
        setPassword,
        setConfirmPassword,
        setConsentAccepted,
        submit,
    } = useRegisterForm();

    return (
        <View style={styles.root}>
            <Image
                source={REGISTER_BACKGROUND}
                style={styles.background}
                resizeMode="cover"
                accessible={false}
            />
            <View style={styles.content}>
                <RegisterForm
                    variant="web"
                    fullName={fullName}
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    consentAccepted={consentAccepted}
                    onChangeFullName={setFullName}
                    onChangeEmail={setEmail}
                    onChangePassword={setPassword}
                    onChangeConfirmPassword={setConfirmPassword}
                    onChangeConsent={setConsentAccepted}
                    onSubmit={submit}
                    onLogin={() => navigate(ROUTES.login)}
                    fullNameError={errors.fullName}
                    emailError={errors.email}
                    passwordError={errors.password}
                    confirmPasswordError={errors.confirmPassword}
                    error={error}
                    loading={loading}
                    showFooter={false}
                />
            </View>
        </View>
    );
}
