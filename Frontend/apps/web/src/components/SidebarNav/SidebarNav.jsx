/**
 * Documento: barra lateral del portal web del agricultor.
 * Solo se usa en la app web; por eso vive en la app y no en @agrodoc/ui.
 * Todo el estado y las acciones llegan por props.
 */
import { useMemo } from 'react';
import { Image, View } from 'react-native';
import {
    AGRODOC_LOGO,
    Button,
    NavItem,
    Text,
    useTheme,
} from '@agrodoc/ui';
import { getStyles } from './SidebarNav.styles';

/** Secciones principales visibles solo en la web. */
const NAV_ITEMS = [
    { key: 'home', icon: 'home', label: 'Inicio' },
    { key: 'crops', icon: 'leaf', label: 'Cultivos' },
    { key: 'history', icon: 'history', label: 'Historial' },
    { key: 'queries', icon: 'chat', label: 'Consultas' },
    { key: 'payments', icon: 'card', label: 'Pagos' },
];

/** Acciones de cuenta ancladas al pie de la barra. */
const FOOTER_ITEMS = [
    { key: 'settings', icon: 'settings', label: 'Ajustes' },
];

/**
 * @param {string} [activeKey] Sección seleccionada.
 * @param {string[]} [disabledKeys] Claves de secciones y acciones bloqueadas.
 * @param {(key: string) => void} [onSelect] Cambia la sección activa.
 * @param {() => void} [onPremium] Abre la suscripción premium.
 * @param {() => void} [onLogout] Cierra la sesión.
 */
export function SidebarNav({
    activeKey = 'queries',
    disabledKeys = [],
    onSelect,
    onPremium,
    onLogout,
    style,
    ...rest
}) {
    const theme = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
        <View {...rest} style={[styles.container, style]}>
            <View style={styles.top}>
                <View style={styles.brand}>
                    <View style={styles.brandRow}>
                        <Image
                            source={AGRODOC_LOGO}
                            style={styles.logo}
                            resizeMode="contain"
                            accessibilityLabel="Logotipo de AgroDoc"
                        />
                        <Text variant="title" color="primary">
                            AGRODOC
                        </Text>
                    </View>
                    <Text variant="body" color="notselected">
                        Portal Agricultor
                    </Text>
                </View>

                <View style={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            selected={activeKey === item.key}
                            disabled={disabledKeys.includes(item.key)}
                            onPress={() => onSelect?.(item.key)}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="SUSCRIPCIÓN PREMIUM"
                    variant="secondary"
                    fullWidth
                    disabled={disabledKeys.includes('premium')}
                    onPress={onPremium}
                />
                {FOOTER_ITEMS.map((item) => (
                    <NavItem
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        selected={activeKey === item.key}
                        disabled={disabledKeys.includes(item.key)}
                        onPress={() => onSelect?.(item.key)}
                    />
                ))}
                <NavItem
                    icon="door"
                    label="Cerrar Sesión"
                    disabled={disabledKeys.includes('logout')}
                    onPress={onLogout}
                />
            </View>
        </View>
    );
}
