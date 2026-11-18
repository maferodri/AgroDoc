/**
 * Documento: estilos de la pantalla de captura móvil.
 * Cámara a pantalla completa con guía de encuadre y controles blancos.
 */
import { StyleSheet } from 'react-native';

export const getStyles = ({ colors, spacing, radius, size }) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: colors.text,
            justifyContent: 'center'
        },
        permission: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.lg,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
        },
        viewfinder: {
            width: '85%',
            aspectRatio: 0.9,
            alignSelf: 'center',
            borderRadius: radius.card,
            
        },
        corner: {
            position: 'absolute',
            width: size.avatarMd,
            height: size.avatarMd,
            borderColor: colors.textOnPrimary,
        },
        cornerTopLeft: {
            top: 0,
            left: 0,
            borderTopWidth: 4,
            borderLeftWidth: 4,
            borderTopLeftRadius: radius.card,
        },
        cornerTopRight: {
            top: 0,
            right: 0,
            borderTopWidth: 4,
            borderRightWidth: 4,
            borderTopRightRadius: radius.card,
        },
        cornerBottomLeft: {
            bottom: 0,
            left: 0,
            borderBottomWidth: 4,
            borderLeftWidth: 4,
            borderBottomLeftRadius: radius.card,
        },
        cornerBottomRight: {
            bottom: 0,
            right: 0,
            borderBottomWidth: 4,
            borderRightWidth: 4,
            borderBottomRightRadius: radius.card,
        },
        controls: {
            alignItems: 'center',
            gap: spacing.md,
            paddingBottom: spacing.xxl,
        },
        gallery: {
            width: size.avatarSm,
            height: size.avatarSm,
            alignItems: 'center',
            justifyContent: 'center',
        },
        shutter: {
            width: size.avatarLg,
            height: size.avatarLg,
            borderRadius: radius.avatar,
            borderWidth: 3,
            borderColor: colors.textOnPrimary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        shutterInner: {
            width: '82%',
            height: '82%',
            borderRadius: radius.avatar,
            backgroundColor: colors.textOnPrimary,
        },
        pressed: {
            opacity: 0.85,
        },
    });
