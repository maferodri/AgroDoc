/**
 * Documento: modal del estado del análisis de la foto.
 * Muestra un indicador de carga mientras el backend clasifica la imagen y un
 * check cuando la respuesta llega. Al terminar, «Continuar» lleva a la
 * pantalla de resultados. Solo existe en móvil.
 */
import { useMemo } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { Button, Icon, Text, useTheme } from '@agrodoc/ui';
import { getStyles } from './AnalysisModal.styles';

/**
 * @param {boolean} visible Controla la apertura del modal.
 * @param {'loading'|'success'} status Estado del análisis.
 * @param {() => void} [onContinue] Continúa a la pantalla de resultados.
 */
export function AnalysisModal({ visible, status = 'loading', onContinue }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const loading = status !== 'success';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            // El botón atrás no cancela la petición en curso.
            onRequestClose={() => {}}
        >
            <View style={styles.backdrop}>
                <View
                    accessibilityRole="alert"
                    accessibilityViewIsModal
                    style={styles.card}
                >
                    <View style={styles.badge}>
                        {loading ? (
                            <ActivityIndicator
                                testID="analysis-loading"
                                size="large"
                                color={theme.colors.textOnPrimary}
                            />
                        ) : (
                            <Icon
                                name="check"
                                size={theme.typography.fontSize.xxxxl}
                                color={theme.colors.textOnPrimary}
                            />
                        )}
                    </View>

                    <Text variant="title" color="primary" align="center">
                        {loading
                            ? 'Analizando Imagen...'
                            : 'Análisis Finalizado Con Éxito'}
                    </Text>

                    <Button
                        title="Continuar"
                        fullWidth
                        disabled={loading}
                        onPress={onContinue}
                    />
                </View>
            </View>
        </Modal>
    );
}
