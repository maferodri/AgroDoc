/**
 * Documento: organismo PasswordResetConfirmForm.
 * Segundo paso de la recuperación (HU1.3): valida el código recibido y define
 * la nueva contraseña. Comparte el layout con PasswordResetForm y cambia por
 * prop (`variant`) entre web y móvil.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { AGRODOC_LOGO } from '../../assets/agrodocLogo';
import { Button } from '../../atoms/Button/Button';
import { Divider } from '../../atoms/Divider/Divider';
import { Text } from '../../atoms/Text/Text';
import { CodeInput } from '../../molecules/CodeInput/CodeInput';
import { PasswordInput } from '../../molecules/PasswordInput/PasswordInput';
import { StepIndicator } from '../../molecules/StepIndicator/StepIndicator';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './PasswordResetConfirmForm.styles';

/** Ayuda fija del campo contraseña, alineada con `registerRequestSchema`. */
const PASSWORD_HELPER = 'Mínimo 8 caracteres, incluye un número.';

/**
 * @param {'mobile'|'web'} [variant] `web` agrega tarjeta, logo y etiqueta de paso.
 * @param {number} [step] Paso actual del flujo (1-based).
 * @param {number} [totalSteps] Cantidad total de pasos del flujo.
 * @param {number} [codeLength] Cantidad de dígitos del código.
 * @param {string} [code] Código controlado por la pantalla.
 * @param {(code: string) => void} [onChangeCode] Callback al escribir el código.
 * @param {string} [newPassword] Nueva contraseña controlada.
 * @param {string} [confirmPassword] Confirmación controlada.
 * @param {(text: string) => void} [onChangeNewPassword] Callback de la contraseña.
 * @param {(text: string) => void} [onChangeConfirmPassword] Callback de la confirmación.
 * @param {() => void} [onSubmit] Envía el formulario.
 * @param {() => void} [onCancel] Cancela el flujo.
 * @param {() => void} [onResend] Reenvía el código.
 * @param {string} [codeError] Error validado del código.
 * @param {string} [newPasswordError] Error validado de la contraseña.
 * @param {string} [confirmPasswordError] Error de la confirmación.
 * @param {string} [error] Error general devuelto por el backend.
 * @param {boolean} [loading] Muestra el botón en estado de carga.
 * @param {string} [submitLabel] Texto del botón principal.
 * @param {string} [cancelLabel] Texto del botón secundario.
 * @param {string} [resendLabel] Texto del enlace de reenvío.
 * @param {string} [title] Título de la variante móvil.
 * @param {string} [brand] Nombre de la marca bajo el logotipo (variante web).
 * @param {string} [subtitle] Bajo título descriptivo (variante web).
 * @param {string} [description] Instrucción bajo la cabecera.
 * @param {string} [codeLabel] Etiqueta del código.
 * @param {object|string} [logoSource] Logo alternativo al asset oficial.
 */
export function PasswordResetConfirmForm({
    variant = 'mobile',
    step = 2,
    totalSteps = 2,
    codeLength = 6,
    code = '',
    onChangeCode,
    newPassword = '',
    confirmPassword = '',
    onChangeNewPassword,
    onChangeConfirmPassword,
    onSubmit,
    onCancel,
    onResend,
    codeError,
    newPasswordError,
    confirmPasswordError,
    error,
    loading = false,
    submitLabel = 'Restablecer',
    cancelLabel = 'Cancelar',
    resendLabel = 'Reenviar Código',
    title = 'Restablecer Contraseña',
    brand,
    subtitle = 'Restablecimiento de Contraseña',
    description = 'Hemos enviado un código de seguridad a su correo electrónico. Ingrese el código y su nueva contraseña a continuación',
    codeLabel = 'Código de Verificación',
    logoSource = AGRODOC_LOGO,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const isWeb = variant === 'web';

    // La marca y su tamaño siguen el mismo criterio que el resto de organismos.
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
                align={isWeb ? 'center' : 'left'}
                style={styles.description}
            >
                {description}
            </Text>

            <View style={styles.form}>
                <CodeInput
                    length={codeLength}
                    value={code}
                    onChangeText={onChangeCode}
                    label={codeLabel}
                    error={codeError}
                    resendLabel={resendLabel}
                    onResend={onResend}
                />

                <Divider style={styles.divider} />

                <PasswordInput
                    label="Nueva Contraseña"
                    placeholder="••••••••"
                    value={newPassword}
                    onChangeText={onChangeNewPassword}
                    error={newPasswordError}
                    helperText={PASSWORD_HELPER}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                />

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

                {error ? (
                    <Text
                        variant="caption"
                        color="danger"
                        align="center"
                        accessibilityLiveRegion="polite"
                    >
                        {error}
                    </Text>
                ) : null}

                <View style={styles.actions}>
                    <Button
                        title={submitLabel}
                        fullWidth
                        loading={loading}
                        onPress={onSubmit}
                    />
                    <Button
                        title={cancelLabel}
                        variant="ghost"
                        fullWidth
                        onPress={onCancel}
                    />
                </View>
            </View>
        </View>
    );
}
