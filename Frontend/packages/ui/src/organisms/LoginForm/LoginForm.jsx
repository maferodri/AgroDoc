/**
 * Documento: organismo LoginForm.
 * Reúne las moléculas FormField, PasswordInput, OrDivider y el átomo Button
 * en un único formulario reutilizable por la app web y la app móvil.
 * El layout cambia por prop (`variant`) y no duplica el componente.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { AGRODOC_LOGO } from '../../assets/agrodocLogo';
import { Button } from '../../atoms/Button/Button';
import { Text } from '../../atoms/Text/Text';
import { FormField } from '../../molecules/FormField/FormField';
import { OrDivider } from '../../molecules/OrDivider/OrDivider';
import { PasswordInput } from '../../molecules/PasswordInput/PasswordInput';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './LoginForm.styles';

/**
 * Formulario de inicio de sesión (HU1.1).
 *
 * @param {'mobile'|'web'} [variant] `web` agrega la tarjeta elevada; `mobile` va sin tarjeta.
 * @param {string} [email] Correo controlado por la pantalla.
 * @param {string} [password] Contraseña controlada por la pantalla.
 * @param {(text: string) => void} [onChangeEmail] Callback al escribir el correo.
 * @param {(text: string) => void} [onChangePassword] Callback al escribir la contraseña.
 * @param {() => void} [onSubmit] Ejecuta el inicio de sesión.
 * @param {() => void} [onForgotPassword] Navega a la recuperación de contraseña.
 * @param {() => void} [onRegister] Navega a la creación de cuenta.
 * @param {string} [emailError] Error validado del correo.
 * @param {string} [passwordError] Error validado de la contraseña.
 * @param {string} [error] Error general devuelto por el backend.
 * @param {boolean} [loading] Muestra el botón en estado de carga.
 * @param {string} [submitLabel] Texto del botón principal.
 * @param {string} [brand] Nombre de la marca bajo el logotipo.
 * @param {string} [subtitle] Bajo título descriptivo del formulario.
 * @param {string} [footerText] Texto legal al pie.
 * @param {boolean} [showFooter] Oculta el pie cuando la pantalla ya lo incluye.
 * @param {object|string} [logoSource] Logo alternativo al asset oficial.
 */
export function LoginForm({
    variant = 'mobile',
    email = '',
    password = '',
    onChangeEmail,
    onChangePassword,
    onSubmit,
    onForgotPassword,
    onRegister,
    emailError,
    passwordError,
    error,
    loading = false,
    submitLabel = 'Iniciar Sesión',
    brand,
    subtitle = 'Acceso al Sistema Técnico Agrícola',
    footerText = `© ${new Date().getFullYear()} AGRODOC TECHNICAL SYSTEMS`,
    showFooter = true,
    logoSource = AGRODOC_LOGO,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isWeb = variant === 'web';

    // La marca y su tamaño cambian de móvil (AGRODOC grande) a web (AgroDoc sobrio).
    const brandLabel = brand ?? (isWeb ? 'AgroDoc' : 'AGRODOC');
    const brandFontSize = isWeb
        ? theme.typography.fontSize.xxxl
        : theme.typography.fontSize.xxl;

    return (
        <View
            {...rest}
            style={[styles.container, isWeb && styles.card, style]}
        >
            <View style={styles.header}>
                <Image
                    source={logoSource}
                    style={styles.logo}
                    resizeMode="contain"
                    accessibilityLabel="Logotipo de AgroDoc"
                />
                <Text
                    variant="title"
                    color={isWeb ? 'text' : 'primary'}
                    align="center"
                    style={{
                        fontSize: brandFontSize,
                        lineHeight: Math.round(
                            brandFontSize * theme.typography.title.lineHeight
                        ),
                    }}
                >
                    {brandLabel}
                </Text>
                <Text
                    variant="subtitle"
                    color="notselected"
                    style={styles.subtitle}
                >
                    {subtitle}
                </Text>
            </View>

            <View style={styles.form}>
                <FormField
                    label="Correo Electrónico"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChangeText={onChangeEmail}
                    error={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                />

                <PasswordInput
                    label="Contraseña"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={onChangePassword}
                    error={passwordError}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                    labelAccessory={
                        onForgotPassword ? (
                            <Text
                                variant="link"
                                align="right"
                                style={styles.labelAccessory}
                                onPress={onForgotPassword}
                            >
                                ¿Olvidaste tu contraseña?
                            </Text>
                        ) : null
                    }
                />

                {error ? (
                    <Text
                        variant="caption"
                        color="danger"
                        align="center"
                        accessibilityLiveRegion="polite"
                        style={styles.formError}
                    >
                        {error}
                    </Text>
                ) : null}

                <View style={styles.submit}>
                    <Button
                        title={submitLabel}
                        fullWidth
                        loading={loading}
                        onPress={onSubmit}
                    />
                </View>
            </View>

            <OrDivider style={styles.divider} />

            <View style={styles.register}>
                <Text variant="body" color="notselected" align="center">
                    ¿No tienes una cuenta?
                </Text>
                <Text variant="link" align="center" onPress={onRegister}>
                    Crear Cuenta
                </Text>
            </View>

            {showFooter && (
                <Text
                    variant="caption"
                    color="notselected"
                    align="center"
                    style={styles.footer}
                >
                    {footerText}
                </Text>
            )}
        </View>
    );
}
