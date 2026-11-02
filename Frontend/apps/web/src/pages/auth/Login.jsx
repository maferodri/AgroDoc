/**
 * Documento: pantalla de inicio de sesión web (HU1.1).
 * Usa el organismo LoginForm y la lógica de `@agrodoc/features`; la página solo
 * compone el fondo, el ancho de la tarjeta y los enlaces de navegación.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { useLoginForm } from '@agrodoc/features';
import { LOGIN_BACKGROUND, LoginForm, useTheme } from '@agrodoc/ui';
import { getStyles } from './Login.styles';

export default function Login() {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    // El store guarda la sesión y el router redirige al lobby del rol.
    const { email, password, errors, error, loading, setEmail, setPassword, submit } =
        useLoginForm();

    return (
        <View style={styles.root}>
            <Image
                source={LOGIN_BACKGROUND}
                style={styles.background}
                resizeMode="cover"
                accessible={false}
            />
            <View style={styles.content}>
                <LoginForm
                    variant="web"
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
                        window.alert('Recuperación de contraseña próximamente')
                    }
                    onRegister={() =>
                        window.alert('Registro de cuenta próximamente')
                    }
                />
            </View>
        </View>
    );
}
