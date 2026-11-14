/**
 * Documento: pantalla de registro móvil (HU1.2).
 * Usa el organismo RegisterForm sobre el fondo oficial y la lógica compartida
 * de `@agrodoc/features` para validar y crear la cuenta.
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
import { useRegisterForm } from '@agrodoc/features';
import { REGISTER_BACKGROUND, RegisterForm, useTheme } from '@agrodoc/ui';
import { getStyles } from './RegisterScreen.styles';

/**
 * @param {() => void} [onLogin] Navega al inicio de sesión.
 */
export default function RegisterScreen({ onLogin }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const { height } = useWindowDimensions();

    // Deja ~16% del alto para el fondo y el resto para la hoja del formulario.
    const sheetTop = Math.round(height * 0.16);

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
                        <RegisterForm
                            variant="mobile"
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
                            onLogin={onLogin}
                            fullNameError={errors.fullName}
                            emailError={errors.email}
                            passwordError={errors.password}
                            confirmPasswordError={errors.confirmPassword}
                            error={error}
                            loading={loading}
                            showFooter={false}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
