/**
 * Documento: pantalla de recuperación de contraseña móvil (HU1.3).
 * Usa los organismos de los dos pasos sobre el fondo de registro y la lógica
 * compartida de `@agrodoc/features` para solicitar y confirmar el cambio.
 */
import { useMemo } from 'react';
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import { getStyles } from './RecoverPasswordScreen.styles';

/**
 * @param {() => void} [onLogin] Navega al inicio de sesión.
 */
export default function RecoverPasswordScreen({ onLogin }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const { height } = useWindowDimensions();

    // Deja ~16% del alto para el fondo y el resto para la hoja del formulario.
    const sheetTop = Math.round(height * 0.16);

    const { email, errors, message, error, loading, setEmail, submit } =
        useRecoverPasswordForm();

    // El paso 2 encadena verificación y confirmación; al terminar vuelve al login.
    const confirm = useConfirmPasswordResetForm({
        email,
        onSuccess: onLogin,
    });

    const handleResend = () => {
        confirm.reset();
        submit();
    };

    return (
        <ImageBackground
            source={REGISTER_BACKGROUND}
            style={styles.root}
            resizeMode="cover"
            accessible={false}
        >
            <StatusBar style="light" />
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.sheet, { marginTop: sheetTop }]}>
                        {message ? (
                            <PasswordResetConfirmForm
                                variant="mobile"
                                code={confirm.code}
                                onChangeCode={confirm.setCode}
                                newPassword={confirm.newPassword}
                                confirmPassword={confirm.confirmPassword}
                                onChangeNewPassword={confirm.setNewPassword}
                                onChangeConfirmPassword={confirm.setConfirmPassword}
                                onSubmit={confirm.submit}
                                onCancel={onLogin}
                                onResend={handleResend}
                                codeError={confirm.errors.code}
                                newPasswordError={confirm.errors.newPassword}
                                confirmPasswordError={
                                    confirm.errors.confirmPassword
                                }
                                error={confirm.error}
                                loading={confirm.loading}
                            />
                        ) : (
                            <PasswordResetForm
                                variant="mobile"
                                email={email}
                                onChangeEmail={setEmail}
                                onSubmit={submit}
                                onLogin={onLogin}
                                emailError={errors.email}
                                error={error}
                                message={message}
                                loading={loading}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
