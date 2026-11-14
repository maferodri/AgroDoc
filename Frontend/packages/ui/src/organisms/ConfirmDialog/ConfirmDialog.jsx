/**
 * Documento: organismo ConfirmDialog.
 * Pide confirmación explícita para acciones destructivas (cerrar sesión o
 * eliminar un cultivo). No conoce la API ni el store: todo entra por props.
 */
import { useMemo } from 'react';
import { Modal, View } from 'react-native';
import { Button } from '../../atoms/Button/Button';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { getStyles } from './ConfirmDialog.styles';

/**
 * @param {boolean} visible Controla la apertura del diálogo.
 * @param {string} title Título de la confirmación.
 * @param {string} [message] Detalle de la acción.
 * @param {string} [confirmLabel] Texto del botón de confirmación.
 * @param {string} [cancelLabel] Texto del botón de cancelación.
 * @param {boolean} [destructive] Pinta la confirmación como acción peligrosa.
 * @param {boolean} [loading] Deshabilita las acciones mientras se ejecuta.
 * @param {() => void} onConfirm Confirma la acción.
 * @param {() => void} onCancel Cierra sin ejecutar.
 */
export function ConfirmDialog({
    visible,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    destructive = false,
    loading = false,
    onConfirm,
    onCancel,
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.backdrop}>
                <View
                    testID="confirm-dialog"
                    accessibilityRole="alert"
                    accessibilityViewIsModal
                    style={styles.card}
                >
                    <Text style={styles.title}>{title}</Text>
                    {message ? (
                        <Text style={styles.message}>{message}</Text>
                    ) : null}

                    <View style={styles.actions}>
                        <Button
                            title={cancelLabel}
                            variant="ghost"
                            onPress={onCancel}
                            disabled={loading}
                        />
                        <Button
                            title={confirmLabel}
                            variant={destructive ? 'danger' : 'primary'}
                            onPress={onConfirm}
                            loading={loading}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}
