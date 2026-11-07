/**
 * Documento: historias del organismo Alert.
 * Presentan las variantes informativa, climática y crítica.
 */
import { View } from 'react-native';
import { Alert } from './Alert';
import { useTheme } from '../../theme/useTheme';

export default {
    title: 'Organismos/Alert',
    component: Alert,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['info', 'weather', 'critical'],
        },
    },
};

export const Info = {
    args: {
        variant: 'info',
        title: 'Nuevo diagnóstico disponible',
        message: 'Tu análisis de la foto ya está listo.',
    },
};

export const Weather = {
    args: {
        variant: 'weather',
        title: 'Lluvia prevista',
        message: 'Considera posponer el riego de esta semana.',
    },
};

export const Critical = {
    args: {
        variant: 'critical',
        title: 'Plaga detectada',
        message: 'Revisa el lote norte lo antes posible.',
    },
};

function AllVariants() {
    const theme = useTheme();

    return (
        <View style={{ gap: theme.spacing.md, width: 420 }}>
            <Alert variant="info" title="Información" message="Detalle info." />
            <Alert variant="weather" title="Clima" message="Detalle clima." />
            <Alert variant="critical" title="Crítico" message="Detalle crítico." />
        </View>
    );
}

export const TodasLasVariantes = {
    render: () => <AllVariants />,
};
