/**
 * Documento: organismo PasswordResetForm.
 * Formulario de solicitud de recuperación de contraseña (HU1.3), compartido
 * por web y móvil. Reúne StepIndicator, FormField, Callout y Button; el
 * layout cambia por prop (`variant`) sin duplicar el componente.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { AGRODOC_LOGO } from '../../assets/agrodocLogo';
import { Button } from '../../atoms/Button/Button';
import { Text } from '../../atoms/Text/Text';
import { Callout } from '../../molecules/Callout/Callout';
import { FormField } from '../../molecules/FormField/FormField';
import { StepIndicator } from '../../molecules/StepIndicator/StepIndicator';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './PasswordResetForm.styles';

/**
 * @param {'mobile'|'web'} [variant] `web` agrega tarjeta, logo y etiqueta de paso.
 * @param {number} [step] Paso actual del flujo (1-based).
 * @param {number} [totalSteps] Cantidad total de pasos del flujo.
 * @param {string} [email] Correo controlado por la pantalla.
 * @param {(text: string) => void} [onChangeEmail] Callback al escribir el correo.
 * @param {() => void} [onSubmit] Envía el código de recuperación.
 * @param {() => void} [onLogin] Navega al inicio de sesión (solo móvil).
 * @param {string} [emailError] Error validado del correo.
 * @param {string} [error] Error general devuelto por el backend.
 * @param {string} [message] Confirmación mostrada tras enviar el código.
 * @param {boolean} [loading] Muestra el botón en estado de carga.
 * @param {string} [submitLabel] Texto del botón principal.
 * @param {string} [title] Título de la variante móvil.
 * @param {string} [brand] Nombre de la marca bajo el logotipo (variante web).
 * @param {string} [subtitle] Bajo título descriptivo (variante web).
 * @param {string} [description] Instrucción bajo la cabecera.
 * @param {string|null} [hint] Aviso gris opcional; `null` lo oculta.
 * @param {boolean} [showLogin] Oculta el pie de inicio de sesión en móvil.
 * @param {object|string} [logoSource] Logo alternativo al asset oficial.
 */
export function PasswordResetForm({
    variant = 'mobile',
    step = 1,
    totalSteps = 2,
    email = '',
    onChangeEmail,
    onSubmit,
    onLogin,
    emailError,
    error,
    message,
    loading = false,
    submitLabel = 'Enviar Código',
    title = 'Restablecer Contraseña',
    brand,
    subtitle = 'Restablecimiento de Contraseña',
    description = 'Introduce tu correo electrónico registrado para recibir un código de verificación.',
    hint = 'Si no tienes acceso a tu correo, contacta con el administrador de la finca o el panel de soporte técnico.',
    showLogin = true,
    logoSource = AGRODOC_LOGO,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isWeb = variant === 'web';

    // La marca y su tamaño siguen el mismo criterio que LoginForm y RegisterForm.
    const brandLabel = brand ?? 'AgroDoc';
    const brandFontSize = theme.typography.fontSize.xxxl;

    return (
        <View
            {...rest}
            style={[styles.container, isWeb && styles.card, style]}
        >
            {/* En móvil el título va antes de la barra; en web la barra abre la tarjeta. */}
            {!isWeb && (
                <Text
                    variant="title"
                    color="primary"
                    align="center"
                    style={styles.titleMobile}
                >
                    {title}
                </Text>
            )}

            <View style={isWeb ? styles.progress : styles.progressMobile}>
                <StepIndicator steps={totalSteps} completed={step} />
                {isWeb && (
                    <Text variant="caption" color="notselected">
                        Paso {step}/{totalSteps}
                    </Text>
                )}
            </View>

            {isWeb && (
                <View style={styles.header}>
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
                </View>
            )}

            <Text
                variant="body"
                color="notselected"
                style={styles.description}
            >
                {description}
            </Text>

            <View style={styles.form}>
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
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                />

                {hint ? <Callout message={hint} /> : null}

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

                {message ? (
                    <Text
                        variant="caption"
                        color="primary"
                        align="center"
                        accessibilityLiveRegion="polite"
                    >
                        {message}
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

            {!isWeb && showLogin && onLogin ? (
                <View style={styles.login}>
                    <Text variant="body" color="notselected" align="center">
                        ¿Ya tienes una cuenta?
                    </Text>
                    <Text variant="link" align="center" onPress={onLogin}>
                        Iniciar Sesión
                    </Text>
                </View>
            ) : null}
        </View>
    );
}
