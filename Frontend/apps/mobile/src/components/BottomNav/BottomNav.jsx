/**
 * Documento: barra de navegación inferior del móvil.
 * Cuatro secciones y la acción de fotografía flotando sobre el centro.
 * Solo se usa en la app móvil; por eso vive en la app y no en @agrodoc/ui.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { NavItem, useTheme } from '@agrodoc/ui';
import { NavAction } from '../NavAction/NavAction';
import { getStyles } from './BottomNav.styles';

/** Secciones visibles solo en móvil. */
const NAV_ITEMS = [
    { key: 'home', icon: 'home', label: 'Inicio', disabled: false },
    { key: 'crops', icon: 'leaf', label: 'Cultivos', disabled: true },
    { key: 'payments', icon: 'card', label: 'Pagos', disabled: true },
    { key: 'settings', icon: 'settings', label: 'Ajustes', disabled: true },
];

/**
 * @param {string} [activeKey] Sección seleccionada.
 * @param {(key: string) => void} [onSelect] Cambia la sección activa.
 * @param {() => void} [onCapture] Abre la cámara.
 * @param {boolean} [captureDisabled] Bloquea la acción de fotografía.
 */
export function BottomNav({
    activeKey = 'home',
    onSelect,
    onCapture,
    captureDisabled = false,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const renderItem = (item) => (
        <NavItem
            key={item.key}
            variant="mobile"
            icon={item.icon}
            label={item.label}
            // La sección activa se muestra habilitada aunque siga sin destino.
            disabled={item.disabled && activeKey !== item.key}
            selected={activeKey === item.key}
            onPress={() => onSelect?.(item.key)}
            style={styles.item}
        />
    );

    return (
        <View {...rest} style={[styles.container, style]}>
            {NAV_ITEMS.slice(0, 2).map(renderItem)}
            <View style={styles.spacer} />
            {NAV_ITEMS.slice(2).map(renderItem)}
            <View style={styles.action} pointerEvents="box-none">
                <NavAction disabled={captureDisabled} onPress={onCapture} />
            </View>
        </View>
    );
}
