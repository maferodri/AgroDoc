/**
 * Documento: organismo Alert.
 * Mensaje destacado para información, clima o incidencias críticas.
 * Es puramente presentacional: recibe título, mensaje y variante por props.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { Icon } from '../../atoms/Icon/Icon';
import { Text } from '../../atoms/Text/Text';
import { useTheme } from '../../theme/useTheme';
import { ALERT_ICONS, ALERT_VARIANTS, getStyles } from './Alert.styles';

/**
 * @param {'info'|'weather'|'critical'} [variant] Tipo de alerta.
 * @param {string} title Título breve.
 * @param {string} [message] Detalle opcional.
 */
export function Alert({ variant = 'info', title, message }) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const resolvedVariant = ALERT_VARIANTS.includes(variant)
        ? variant
        : 'info';
    const variantStyle = styles.variant[resolvedVariant];

    return (
        <View
            testID={`alert-${resolvedVariant}`}
            accessibilityRole="alert"
            accessibilityLabel={title}
            style={[
                styles.container,
                {
                    backgroundColor: variantStyle.backgroundColor,
                    borderColor: variantStyle.borderColor,
                },
            ]}
        >
            <Icon
                name={ALERT_ICONS[resolvedVariant]}
                size={theme.typography.fontSize.lg}
                color={variantStyle.color}
            />
            <View style={styles.content}>
                <Text style={[styles.title, { color: variantStyle.color }]}>
                    {title}
                </Text>
                {message ? (
                    <Text style={styles.message}>{message}</Text>
                ) : null}
            </View>
        </View>
    );
}
