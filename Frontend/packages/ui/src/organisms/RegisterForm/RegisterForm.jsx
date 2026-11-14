/**
 * Documento: organismo RegisterForm.
 * Reúne FormField, PasswordInput, CheckboxInput, Divider y Button en el
 * formulario de creación de cuenta (HU1.2), compartido por web y móvil.
 * El layout cambia por prop (`variant`) y no duplica el componente.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { AGRODOC_LOGO } from '../../assets/agrodocLogo';
import { Button } from '../../atoms/Button/Button';
import { Divider } from '../../atoms/Divider/Divider';
import { Text } from '../../atoms/Text/Text';
import { CheckboxInput } from '../../molecules/CheckboxInput/CheckboxInput';
import { FormField } from '../../molecules/FormField/FormField';
import { PasswordInput } from '../../molecules/PasswordInput/PasswordInput';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './RegisterForm.styles';

/** Ayuda fija del campo contraseña, alineada con `registerRequestSchema`. */
const PASSWORD_HELPER = 'Mínimo 8 caracteres, incluye un número.';

/**
 * Formulario de registro de usuario (HU1.2).
 *
 * @param {'mobile'|'web'} [variant] `web` agrega la tarjeta y pone las contraseñas en fila.
 * @param {string} [fullName] Nombre controlado por la pantalla.
 * @param {string} [email] Correo controlado por la pantalla.
 * @param {string} [password] Contraseña controlada por la pantalla.
 * @param {string} [confirmPassword] Confirmación de la contraseña.
 * @param {boolean} [consentAccepted] Aceptación del uso de fotos (opcional).
 * @param {(text: string) => void} [onChangeFullName] Callback al escribir el nombre.
 * @param {(text: string) => void} [onChangeEmail] Callback al escribir el correo.
 * @param {(text: string) => void} [onChangePassword] Callback al escribir la contraseña.
 * @param {(text: string) => void} [onChangeConfirmPassword] Callback al confirmar.
 * @param {(checked: boolean) => void} [onChangeConsent] Cambia la aceptación del uso de fotos.
 * @param {() => void} [onSubmit] Ejecuta el registro.
 * @param {() => void} [onLogin] Navega al inicio de sesión.
 * @param {string} [fullNameError] Error validado del nombre.
 * @param {string} [emailError] Error validado del correo.
 * @param {string} [passwordError] Error validado de la contraseña.
 * @param {string} [confirmPasswordError] Error de la confirmación.
 * @param {string} [error] Error general devuelto por el backend.
 * @param {boolean} [loading] Muestra el botón en estado de carga.
 * @param {string} [submitLabel] Texto del botón principal.
 * @param {string} [brand] Nombre de la marca bajo el logotipo (variante web).
 * @param {string} [subtitle] Bajo título descriptivo (variante web).
 * @param {string} [title] Título de la variante móvil, sin logotipo.
 * @param {string} [footerText] Texto legal al pie.
 * @param {boolean} [showFooter] Oculta el pie cuando la pantalla ya lo incluye.
 * @param {object|string} [logoSource] Logo alternativo al asset oficial.
 */
export function RegisterForm({
    variant = 'mobile',
    fullName = '',
    email = '',
    password = '',
    confirmPassword = '',
    consentAccepted = false,
    onChangeFullName,
    onChangeEmail,
    onChangePassword,
    onChangeConfirmPassword,
    onChangeConsent,
    onSubmit,
    onLogin,
    fullNameError,
    emailError,
    passwordError,
    confirmPasswordError,
    error,
    loading = false,
    submitLabel = 'Crear Cuenta',
    brand,
    subtitle = 'Registro de Usuario',
    title = 'Registro De Usuario',
    footerText = `© ${new Date().getFullYear()} AGRODOC TECHNICAL SYSTEMS`,
    showFooter = true,
    logoSource = AGRODOC_LOGO,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isWeb = variant === 'web';

    // La marca y su tamaño siguen el mismo criterio que LoginForm.
    const brandLabel = brand ?? (isWeb ? 'AgroDoc' : 'AGRODOC');
    const brandFontSize = isWeb
        ? theme.typography.fontSize.xxxl
        : theme.typography.fontSize.xxl;

    return (
        <View
            {...rest}
            style={[styles.container, isWeb && styles.card, style]}
        >
            <View style={[styles.header, !isWeb && styles.headerMobile]}>
                {isWeb ? (
                    <>
                        <Image
                            source={logoSource}
                            style={styles.logo}
                            resizeMode="contain"
                            accessibilityLabel="Logotipo de AgroDoc"
                        />
                        <Text
                            variant="title"
                            color="text"
                            align="center"
                            style={{
                                fontSize: brandFontSize,
                                lineHeight: Math.round(
                                    brandFontSize *
                                        theme.typography.title.lineHeight
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
                    </>
                ) : (
                    // En móvil el título va solo, dentro de la hoja blanca.
                    <Text variant="title" color="primary" align="center">
                        {title}
                    </Text>
                )}
            </View>

            <View style={styles.form}>
                <FormField
                    label="Nombre"
                    placeholder="Ej: Juan Pérez"
                    value={fullName}
                    onChangeText={onChangeFullName}
                    error={fullNameError}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                />

                <FormField
                    label="Correo Electrónico"
                    placeholder="usuario@agro.com"
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

                {/* En web las contraseñas van en fila; en móvil se apilan. */}
                <View style={isWeb ? styles.passwordRow : styles.passwordStack}>
                    <View style={isWeb && styles.passwordField}>
                        <PasswordInput
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={onChangePassword}
                            error={passwordError}
                            helperText={PASSWORD_HELPER}
                            autoComplete="new-password"
                            textContentType="newPassword"
                            returnKeyType="next"
                        />
                    </View>
                    <View style={isWeb && styles.passwordField}>
                        <PasswordInput
                            label="Confirmar Contraseña"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={onChangeConfirmPassword}
                            error={confirmPasswordError}
                            autoComplete="new-password"
                            textContentType="newPassword"
                            returnKeyType="go"
                            onSubmitEditing={onSubmit}
                        />
                    </View>
                </View>

                <CheckboxInput
                    checked={consentAccepted}
                    onChange={onChangeConsent}
                    label="Acepto que mis fotos se usen para mejorar el modelo de predicción agrícola (opcional)"
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

            <Divider style={styles.divider} />

            <View style={styles.login}>
                <Text variant="body" color="notselected" align="center">
                    ¿Ya tienes una cuenta?
                </Text>
                <Text variant="link" align="center" onPress={onLogin}>
                    Iniciar Sesión
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
