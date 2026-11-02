/**
 * Documento: pantalla de inicio de sesión móvil (HU1.1).
 * Usa el organismo LoginForm sobre el fondo oficial y la lógica compartida de
 * `@agrodoc/features` para validar y enviar las credenciales.
 */
import { useMemo } from 'react';
import {
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLoginForm } from '@agrodoc/features';
import { LOGIN_BACKGROUND, LoginForm, Text, useTheme } from '@agrodoc/ui';
import { getStyles } from './LoginScreen.styles';

export default function LoginScreen() {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const { height } = useWindowDimensions();

    // Deja ~16% del alto para el fondo y el resto para la hoja del formulario.
    const sheetTop = Math.round(height * 0.16);

    const { email, password, errors, error, loading, setEmail, setPassword, submit } =
        useLoginForm();

    return (
        <ImageBackground
            source={LOGIN_BACKGROUND}
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
                        <LoginForm
                            variant="mobile"
                            email={email}
                            password={password}
                            onChangeEmail={setEmail}
                            onChangePassword={setPassword}
                            onSubmit={submit}
                            emailError={errors.email}
                            passwordError={errors.password}
                            error={error}
                            loading={loading}
                            showFooter={false}
                            onForgotPassword={() =>
                                Alert.alert(
                                    'Recuperación de contraseña',
                                    'Disponible próximamente.'
                                )
                            }
                            onRegister={() =>
                                Alert.alert(
                                    'Crear cuenta',
                                    'Disponible próximamente.'
                                )
                            }
                        />

                        <View style={styles.footer}>
                            <Text variant="caption" color="notselected" align="center">
                                {`© ${new Date().getFullYear()} AGRODOC TECHNICAL SYSTEMS`}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
