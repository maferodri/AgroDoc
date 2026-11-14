/**
 * Documento: historias del átomo Badge.
 * Muestran todas las variantes de estado.
 */
import { View } from 'react-native';
import { Badge } from './Badge';
import { useTheme } from '../../theme/useTheme';

export default {
    title: 'Átomos/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['healthy', 'warning', 'danger', 'premium'],
        },
    },
};

export const Healthy = { args: { variant: 'healthy', children: 'Saludable' } };
export const Warning = { args: { variant: 'warning', children: 'Atención' } };
export const Danger = { args: { variant: 'danger', children: 'Riesgo' } };
export const Premium = { args: { variant: 'premium', children: 'Premium' } };

function AllVariants() {
    const theme = useTheme();

    return (
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Badge variant="healthy">Saludable</Badge>
            <Badge variant="warning">Atención</Badge>
            <Badge variant="danger">Riesgo</Badge>
            <Badge variant="premium">Premium</Badge>
        </View>
    );
}

export const TodasLasVariantes = {
    render: () => <AllVariants />,
};
