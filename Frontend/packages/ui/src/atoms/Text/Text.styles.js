/**
 * Documento: estilos del átomo Text.
 * Resuelve familia tipográfica, variantes, colores semánticos y alineación
 * desde los tokens del tema.
 */
import { StyleSheet } from 'react-native';
import { resolveFontFamily } from './fontFamily';

/** Variantes de texto disponibles; cada una apunta a un rol tipográfico. */
export const TEXT_VARIANTS = ['title', 'subtitle', 'body', 'caption', 'label', 'link'];

/** Colores semánticos permitidos para texto (nunca valores hex). */
export const TEXT_COLORS = [
    'text',
    'primary',
    'danger',
    'success',
    'warning',
    'notselected',
    'special',
    'textOnPrimary',
    'secondary',
];

/** Alineaciones soportadas por la prop `align`. */
export const TEXT_ALIGNS = ['left', 'center', 'right'];

export const getStyles = ({ colors, typography }) => {
    // Cada variante toma fontSize y fontWeight del token y convierte el
    // lineHeight relativo del tema a píxeles, que es lo que espera React Native.
    const variant = Object.fromEntries(
        TEXT_VARIANTS.map((name) => {
            const token = typography[name] ?? typography.body;
            const ratio = typeof token.lineHeight === 'number'
                ? token.lineHeight
                : typography.lineHeight?.normal ?? 1.5;

            return [
                name,
                {
                    fontFamily: resolveFontFamily(typography.fontFamily?.primary),
                    fontSize: token.fontSize,
                    fontWeight: token.fontWeight,
                    lineHeight: Math.round(token.fontSize * ratio),
                    // El rol enlace se distingue visualmente con subrayado.
                    ...(name === 'link' ? { textDecorationLine: 'underline' } : {}),
                },
            ];
        })
    );

    // Solo se crean estilos para los colores que existan en el tema.
    const color = Object.fromEntries(
        TEXT_COLORS
            .filter((name) => colors[name])
            .map((name) => [name, { color: colors[name] }])
    );

    const align = {
        left: { textAlign: 'left' },
        center: { textAlign: 'center' },
        right: { textAlign: 'right' },
    };

    return {
        variant: StyleSheet.create(variant),
        color: StyleSheet.create(color),
        align: StyleSheet.create(align),
    };
};
